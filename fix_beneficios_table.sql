-- Migration: Adicionar coluna destaques à tabela beneficios
-- Execute no SQL Editor do Supabase Dashboard

-- Adicionar coluna destaques se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'beneficios' AND column_name = 'destaques'
    ) THEN
        ALTER TABLE beneficios ADD COLUMN destaques TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Verificar se RLS está habilitado
ALTER TABLE beneficios ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
DROP POLICY IF EXISTS "Beneficios visiveis publicamente" ON beneficios;
CREATE POLICY "Beneficios visiveis publicamente" ON beneficios
  FOR SELECT TO anon, authenticated USING (true);

-- Política para permitir edição apenas por admins
DROP POLICY IF EXISTS "Beneficios editaveis por admins" ON beneficios;
CREATE POLICY "Beneficios editaveis por admins" ON beneficios
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM representantes 
      WHERE representantes.user_id = auth.uid() 
      AND representantes.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM representantes 
      WHERE representantes.user_id = auth.uid() 
      AND representantes.role = 'admin'
    )
  );

-- Atualizar a tabela para garantir que destaques seja um array vazio por padrão
UPDATE beneficios SET destaques = '{}' WHERE destaques IS NULL;
