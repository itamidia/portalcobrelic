-- CORRIGIR POLÍTICAS RLS PARA REPRESENTANTES
-- Execute no Supabase SQL Editor

-- 1. Garantir que RLS está habilitado
ALTER TABLE public.representantes ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários veem seus próprios dados" ON public.representantes;
DROP POLICY IF EXISTS "Permitir inserção durante cadastro" ON public.representantes;
DROP POLICY IF EXISTS "Permitir leitura própria" ON public.representantes;
DROP POLICY IF EXISTS "Permitir atualização própria" ON public.representantes;

-- 3. Criar política para SELECT (usuário vê seus próprios dados)
CREATE POLICY "Usuário vê seus dados" ON public.representantes
    FOR SELECT
    USING (user_id = auth.uid());

-- 4. Criar política para INSERT (usuário pode criar seu cadastro)
CREATE POLICY "Usuário pode criar cadastro" ON public.representantes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 5. Criar política para UPDATE (usuário pode atualizar seus dados)
CREATE POLICY "Usuário pode atualizar" ON public.representantes
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'representantes';
