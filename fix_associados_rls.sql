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

-- Policy: Usuários autenticados podem criar associados vinculados ao seu representante
CREATE POLICY "Users can insert own associado"
ON associados FOR INSERT
TO authenticated
WITH CHECK (
  -- Se for admin, pode criar qualquer associado
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  OR
  -- Se for representante, só pode criar associado com seu próprio ID
  representante_id = (
    SELECT id FROM representantes 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own associado"
ON associados FOR SELECT
TO authenticated
USING (
  -- Se é admin, pode ver todos
  EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  OR
  -- Se for representante, só pode ver seus próprios associados
  representante_id = (
    SELECT id FROM representantes 
    WHERE user_id = auth.uid()
  )
);

-- Verificar dados existentes
SELECT 'Total de associados:' as info, COUNT(*) as total FROM associados;
SELECT 'Pendentes:' as info, COUNT(*) as total FROM associados WHERE status_aprovacao = 'pendente';
