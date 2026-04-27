-- Adicionar coluna 'canal' na tabela notificacoes
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna canal
ALTER TABLE notificacoes 
ADD COLUMN IF NOT EXISTS canal VARCHAR(50) DEFAULT 'notificacao';

-- 2. Atualizar registros existentes para ter um valor padrão
UPDATE notificacoes 
SET canal = 'notificacao' 
WHERE canal IS NULL;

-- 3. Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notificacoes';
