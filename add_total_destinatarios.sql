-- Adicionar coluna 'total_destinatarios' na tabela notificacoes
-- Execute este script no Supabase SQL Editor

ALTER TABLE notificacoes 
ADD COLUMN IF NOT EXISTS total_destinatarios INTEGER DEFAULT 1;

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notificacoes';
