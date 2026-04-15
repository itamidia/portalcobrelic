-- Adicionar coluna 'cargo' na tabela representantes
-- Execute no Supabase SQL Editor

-- Adicionar coluna cargo se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'representantes' 
        AND column_name = 'cargo'
    ) THEN
        ALTER TABLE public.representantes ADD COLUMN cargo TEXT;
    END IF;
END $$;

-- Adicionar coluna foto_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'representantes' 
        AND column_name = 'foto_url'
    ) THEN
        ALTER TABLE public.representantes ADD COLUMN foto_url TEXT;
    END IF;
END $$;

-- Adicionar coluna biografia se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'representantes' 
        AND column_name = 'biografia'
    ) THEN
        ALTER TABLE public.representantes ADD COLUMN biografia TEXT;
    END IF;
END $$;

-- Adicionar coluna descricao se não existir (para compatibilidade)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'representantes' 
        AND column_name = 'descricao'
    ) THEN
        ALTER TABLE public.representantes ADD COLUMN descricao TEXT;
    END IF;
END $$;

-- Verificar colunas criadas
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'representantes' 
ORDER BY ordinal_position;
