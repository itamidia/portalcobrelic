-- Criar RLS policies para tabela associados
-- Habilitar RLS na tabela
ALTER TABLE associados ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes para evitar conflitos
DROP POLICY IF EXISTS "Admins can view all associados" ON associados;
DROP POLICY IF EXISTS "Admins can update all associados" ON associados;
DROP POLICY IF EXISTS "Admins can delete all associados" ON associados;
DROP POLICY IF EXISTS "Anyone can insert associados" ON associados;
DROP POLICY IF EXISTS "Users can view own associado" ON associados;

-- Policy: Admin pode ver todos os associados
CREATE POLICY "Admins can view all associados"
ON associados FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admin pode atualizar todos os associados
CREATE POLICY "Admins can update all associados"
ON associados FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admin pode deletar todos os associados
CREATE POLICY "Admins can delete all associados"
ON associados FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Qualquer um pode criar associados (para cadastro público)
CREATE POLICY "Anyone can insert associados"
ON associados FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own associado"
ON associados FOR SELECT
TO authenticated
USING (
  -- Se tem user_id e é o usuário logado
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR
  -- Ou se é admin
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verificar dados existentes
SELECT 'Total de associados:' as info, COUNT(*) as total FROM associados;
SELECT 'Pendentes:' as info, COUNT(*) as total FROM associados WHERE status_aprovacao = 'pendente';
