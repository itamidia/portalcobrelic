-- Corrigir política de INSERT na tabela associados
-- Remover política existente
DROP POLICY IF EXISTS "Anyone can insert associados" ON associados;

-- Nova política: Usuários autenticados podem criar associados vinculados ao seu user_id
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
  -- Se for usuário comum, só pode criar associado com seu user_id
  user_id = auth.uid()
);
