-- Adicionar campo role na tabela representantes
ALTER TABLE representantes ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_representantes_role ON representantes(role);

-- Atualizar RLS policies para permitir admin ver todos os representantes

-- Policy para admins verem todos os representantes
CREATE POLICY "Admins can view all representantes"
ON representantes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes r 
    WHERE r.user_id = auth.uid() 
    AND r.role = 'admin'
  )
);

-- Policy para admins atualizarem qualquer representante
CREATE POLICY "Admins can update all representantes"
ON representantes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes r 
    WHERE r.user_id = auth.uid() 
    AND r.role = 'admin'
  )
);

-- Policy para admins deletarem qualquer representante
CREATE POLICY "Admins can delete all representantes"
ON representantes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM representantes r 
    WHERE r.user_id = auth.uid() 
    AND r.role = 'admin'
  )
);

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
