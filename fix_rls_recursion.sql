-- Corrigir recursão infinita nas RLS policies
-- O problema: policies que consultam representantes dentro de representantes causam loop

-- 1. Primeiro, remover todas as policies problemáticas
DROP POLICY IF EXISTS "Admins can view all representantes" ON representantes;
DROP POLICY IF EXISTS "Admins can update all representantes" ON representantes;
DROP POLICY IF EXISTS "Admins can delete all representantes" ON representantes;

-- 2. Criar função segura para verificar admin (security definer evita recursão)
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar policies usando a função (não consulta direta)
CREATE POLICY "Admins can view all representantes"
ON representantes FOR SELECT
TO authenticated
USING (
  is_user_admin(auth.uid())
);

CREATE POLICY "Admins can update all representantes"
ON representantes FOR UPDATE
TO authenticated
USING (
  is_user_admin(auth.uid())
);

CREATE POLICY "Admins can delete all representantes"
ON representantes FOR DELETE
TO authenticated
USING (
  is_user_admin(auth.uid())
);

-- 4. Manter a policy para usuários verem seus próprios dados (sem recursão)
-- Esta é a policy original que funciona
DROP POLICY IF EXISTS "Users can view own representante" ON representantes;
CREATE POLICY "Users can view own representante"
ON representantes FOR SELECT
TO authenticated
USING (user_id = auth.uid());
