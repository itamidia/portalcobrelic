-- Verificar/Criar tabela pagamentos se não existir
-- Execute no SQL Editor do Supabase

-- Verificar se tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'pagamentos'
);

-- Se não existir, criar tabela pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES associados(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES planos(id) ON DELETE SET NULL,
  
  -- Valores
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  
  -- Datas
  data_vencimento DATE,
  data_pagamento TIMESTAMP,
  data_referencia DATE, -- Mês de referência
  
  -- Link de pagamento
  link_pagamento TEXT,
  metodo_pagamento VARCHAR(50),
  
  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pagamentos_associado ON pagamentos(associado_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);

-- Habilitar RLS
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Pagamentos visiveis pelo associado" ON pagamentos;
CREATE POLICY "Pagamentos visiveis pelo associado" ON pagamentos
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM associados 
      WHERE associados.id = pagamentos.associado_id 
      AND associados.user_id = auth.uid()
    )
  );

-- Verificar colunas da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pagamentos' 
AND table_schema = 'public';
