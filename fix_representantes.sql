-- Verificar se tabela representantes existe e criar se necessário
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela representantes se não existir
CREATE TABLE IF NOT EXISTS public.representantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    endereco TEXT,
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT false,
    status_aprovacao TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Verificar se coluna user_id existe (adicionar se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'representantes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.representantes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Habilitar RLS
ALTER TABLE public.representantes ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Política para usuários verem seus próprios dados
DROP POLICY IF EXISTS "Usuários veem seus próprios dados" ON public.representantes;
CREATE POLICY "Usuários veem seus próprios dados" ON public.representantes
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para permitir inserção durante cadastro
DROP POLICY IF EXISTS "Permitir inserção durante cadastro" ON public.representantes;
CREATE POLICY "Permitir inserção durante cadastro" ON public.representantes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_representantes_user_id ON public.representantes(user_id);
CREATE INDEX IF NOT EXISTS idx_representantes_cpf ON public.representantes(cpf);

-- 6. Verificar tabela criada
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'representantes' 
ORDER BY ordinal_position;
