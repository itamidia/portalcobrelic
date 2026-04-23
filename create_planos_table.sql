-- Migration: Criar tabela de Planos com referência aos Benefícios existentes
-- Execute no SQL Editor do Supabase Dashboard

-- ============================================
-- TABELA: planos
-- ============================================
CREATE TABLE IF NOT EXISTS planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  link_pagamento TEXT, -- Link direto do Asaas ou outro gateway
  beneficios_ids UUID[] DEFAULT '{}', -- Array de IDs dos beneficios incluídos (referencia tabela beneficios)
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  cor_destaque TEXT DEFAULT '#1e3a5f', -- Cor para destacar o plano na UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS: Planos
-- ============================================
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de planos ativos
DROP POLICY IF EXISTS "Planos visiveis publicamente" ON planos;
CREATE POLICY "Planos visiveis publicamente" ON planos
  FOR SELECT TO anon, authenticated USING (ativo = true);

-- Política para permitir gerenciamento apenas por admins
DROP POLICY IF EXISTS "Planos gerenciaveis por admins" ON planos;
CREATE POLICY "Planos gerenciaveis por admins" ON planos
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM representantes 
      WHERE representantes.user_id = auth.uid() 
      AND representantes.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM representantes 
      WHERE representantes.user_id = auth.uid() 
      AND representantes.role = 'admin'
    )
  );

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para planos
DROP TRIGGER IF EXISTS update_planos_updated_at ON planos;
CREATE TRIGGER update_planos_updated_at
  BEFORE UPDATE ON planos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos(ativo);
CREATE INDEX IF NOT EXISTS idx_planos_ordem ON planos(ordem);

-- ============================================
-- DADOS INICIAIS: Plano Padrão (migração do valor estático R$ 30)
-- ============================================
-- Primeiro, pegar todos os IDs de beneficios ativos
DO $$
DECLARE
  todos_beneficios UUID[];
BEGIN
  -- Buscar todos os beneficios ativos
  SELECT ARRAY_AGG(id) INTO todos_beneficios
  FROM beneficios 
  WHERE ativo = true;

  -- Inserir plano padrão com todos os beneficios
  INSERT INTO planos (titulo, descricao, valor, link_pagamento, beneficios_ids, ativo, ordem, cor_destaque)
  VALUES (
    'Plano Premium COBRENC',
    'Acesso completo a Telemedicina e Clube de Descontos em +30 mil estabelecimentos em todo Brasil. Inclui todos os benefícios disponíveis.',
    30.00,
    NULL, -- Será preenchido pelo admin com link do Asaas
    COALESCE(todos_beneficios, '{}'),
    true,
    1,
    '#d4af37'
  )
  ON CONFLICT DO NOTHING;
END $$;
