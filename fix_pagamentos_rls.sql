-- Corrigir permissões RLS para pagamentos
-- Execute no SQL Editor do Supabase

-- Remover políticas existentes de pagamentos
DROP POLICY IF EXISTS "Pagamentos visiveis pelo associado" ON pagamentos;
DROP POLICY IF EXISTS "Pagamentos inseridos por admin" ON pagamentos;
DROP POLICY IF EXISTS "Permitir insercao de pagamentos" ON pagamentos;

-- Política 1: Usuário pode ver seus próprios pagamentos (via representante)
CREATE POLICY "Pagamentos visiveis pelo associado" ON pagamentos
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM associados a
      JOIN representantes r ON r.id = a.representante_id
      WHERE a.id = pagamentos.associado_id 
      AND r.user_id = auth.uid()
    )
  );

-- Política 2: Permitir inserção para usuários autenticados
CREATE POLICY "Permitir insercao de pagamentos" ON pagamentos
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Política 3: Permitir atualização para usuários autenticados
DROP POLICY IF EXISTS "Permitir atualizacao de pagamentos" ON pagamentos;
CREATE POLICY "Permitir atualizacao de pagamentos" ON pagamentos
  FOR UPDATE TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Verificar políticas criadas
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pagamentos';
