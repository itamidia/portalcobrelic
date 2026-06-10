-- Habilitar leitura pública da tabela representantes
-- Execute este script no Supabase SQL Editor

-- Permitir leitura pública (SELECT) para todos
DROP POLICY IF EXISTS "Permitir leitura pública de representantes" ON representantes;
CREATE POLICY "Permitir leitura pública de representantes"
ON representantes
FOR SELECT
TO anon, authenticated
USING (true);

-- Verificar se a política foi criada
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
