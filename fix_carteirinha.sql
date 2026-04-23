-- Migration: Adicionar coluna codigo_carteirinha à tabela associados
-- Execute no SQL Editor do Supabase Dashboard

-- Adicionar coluna codigo_carteirinha se não existir
ALTER TABLE associados ADD COLUMN IF NOT EXISTS codigo_carteirinha TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_associados_codigo_carteirinha ON associados(codigo_carteirinha);

-- Atualizar registros existentes com código gerado automaticamente
UPDATE associados 
SET codigo_carteirinha = 'ANALC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))
WHERE codigo_carteirinha IS NULL;

-- Garantir que RLS está habilitado
ALTER TABLE associados ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura por admins
DROP POLICY IF EXISTS "Associados visiveis para admins" ON associados;
CREATE POLICY "Associados visiveis para admins" ON associados
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM representantes 
      WHERE representantes.user_id = auth.uid() 
      AND representantes.role = 'admin'
    )
  );

-- Política para permitir leitura pública (para verificação de carteirinha)
DROP POLICY IF EXISTS "Associados visiveis publicamente para verificacao" ON associados;
CREATE POLICY "Associados visiveis publicamente para verificacao" ON associados
  FOR SELECT TO anon, authenticated 
  USING (true);
