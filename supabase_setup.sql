-- ============================================
-- SETUP COMPLETO - Portal COBRELIC no Supabase
-- Copie e cole no SQL Editor do seu projeto
-- ============================================

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Tabela de Cidades
CREATE TABLE IF NOT EXISTS cidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado TEXT NOT NULL,
  populacao INTEGER,
  descricao TEXT,
  imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Presidentes Municipais
CREATE TABLE IF NOT EXISTS presidentes_municipais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  cidade_id UUID REFERENCES cidades(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendente',
  ativo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Diretoria
CREATE TABLE IF NOT EXISTS diretoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  cargo TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  foto_url TEXT,
  biografia TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Representantes (Líderes Comunitários)
CREATE TABLE IF NOT EXISTS representantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  endereco TEXT,
  cep TEXT,
  data_nascimento DATE,
  profissao TEXT,
  biografia TEXT,
  foto_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT false,
  status_aprovacao TEXT DEFAULT 'pendente',
  aprovado_por UUID REFERENCES presidentes_municipais(id),
  data_aprovacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Associados
CREATE TABLE IF NOT EXISTS associados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  status_aprovacao TEXT DEFAULT 'pendente',
  status_assinatura TEXT DEFAULT 'inativo',
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  link_pagamento TEXT,
  data_proximo_pagamento DATE,
  data_primeiro_pagamento DATE,
  representante_id UUID REFERENCES representantes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Benefícios
CREATE TABLE IF NOT EXISTS beneficios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  tipo TEXT DEFAULT 'basico',
  link_externo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Parceiros
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  categoria TEXT,
  desconto TEXT,
  cidade TEXT,
  estado TEXT,
  endereco TEXT,
  telefone TEXT,
  site TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES associados(id) ON DELETE CASCADE,
  asaas_payment_id TEXT,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente',
  metodo_pagamento TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Notícias
CREATE TABLE IF NOT EXISTS noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  imagem_url TEXT,
  categoria TEXT,
  destaque BOOLEAN DEFAULT false,
  autor_id UUID REFERENCES presidentes_municipais(id),
  visualizacoes INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  publicado_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Anúncios
CREATE TABLE IF NOT EXISTS anuncios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  link TEXT,
  posicao TEXT DEFAULT 'home',
  ordem INTEGER DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Vídeo Clube
CREATE TABLE IF NOT EXISTS video_clube (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  url_video TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT DEFAULT 'string',
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Equipe
CREATE TABLE IF NOT EXISTS equipe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cargo TEXT,
  cidade_id UUID REFERENCES cidades(id) ON DELETE CASCADE,
  presidente_id UUID REFERENCES presidentes_municipais(id) ON DELETE SET NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info',
  destinatario_id UUID REFERENCES representantes(id) ON DELETE CASCADE,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMPTZ,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_representantes_email ON representantes(email);
CREATE INDEX IF NOT EXISTS idx_representantes_user_id ON representantes(user_id);
CREATE INDEX IF NOT EXISTS idx_representantes_status ON representantes(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_associados_email ON associados(email);
CREATE INDEX IF NOT EXISTS idx_associados_status ON associados(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_pagamentos_associado ON pagamentos(associado_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON notificacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_cidade ON parceiros(cidade, estado);

-- ============================================
-- 3. FUNÇÃO UPDATE_UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 4. TRIGGERS
-- ============================================
CREATE TRIGGER update_representantes_updated_at BEFORE UPDATE ON representantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_associados_updated_at BEFORE UPDATE ON associados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presidentes_updated_at BEFORE UPDATE ON presidentes_municipais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diretoria_updated_at BEFORE UPDATE ON diretoria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beneficios_updated_at BEFORE UPDATE ON beneficios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anuncios_updated_at BEFORE UPDATE ON anuncios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parceiros_updated_at BEFORE UPDATE ON parceiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipe_updated_at BEFORE UPDATE ON equipe
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_clube_updated_at BEFORE UPDATE ON video_clube
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS - HABILITAR
-- ============================================
ALTER TABLE representantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE associados ENABLE ROW LEVEL SECURITY;
ALTER TABLE presidentes_municipais ENABLE ROW LEVEL SECURITY;
ALTER TABLE diretoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_clube ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS - POLÍTICAS
-- ============================================

-- Representantes
CREATE POLICY "Representantes visiveis autenticados" ON representantes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios veem proprios dados" ON representantes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios atualizam proprios dados" ON representantes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios criam proprio perfil" ON representantes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Associados
CREATE POLICY "Associados visiveis proprio usuario" ON associados
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM representantes WHERE representantes.id = associados.representante_id AND representantes.user_id = auth.uid())
  );
CREATE POLICY "Associados criados pelo usuario" ON associados
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM representantes WHERE representantes.id = associados.representante_id AND representantes.user_id = auth.uid())
  );

-- Dados públicos
CREATE POLICY "Beneficios publicos" ON beneficios
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Parceiros publicos" ON parceiros
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Noticias publicas" ON noticias
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Noticias inserir autenticado" ON noticias
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Noticias atualizar autenticado" ON noticias
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Noticias deletar autenticado" ON noticias
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Video Clube publico" ON video_clube
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Video Clube inserir autenticado" ON video_clube
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Video Clube atualizar autenticado" ON video_clube
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Video Clube deletar autenticado" ON video_clube
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anuncios publicos" ON anuncios
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Anuncios inserir autenticado" ON anuncios
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anuncios atualizar autenticado" ON anuncios
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anuncios deletar autenticado" ON anuncios
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Cidades publicas" ON cidades
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Diretoria publica" ON diretoria
  FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Presidentes aprovados publicos" ON presidentes_municipais
  FOR SELECT TO anon, authenticated USING (status = 'aprovado' AND ativo = true);
CREATE POLICY "Equipe publica" ON equipe
  FOR SELECT TO anon, authenticated USING (ativo = true);

-- Notificações
CREATE POLICY "Notificacoes do usuario" ON notificacoes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM representantes WHERE representantes.id = notificacoes.destinatario_id AND representantes.user_id = auth.uid())
  );

-- Pagamentos
CREATE POLICY "Pagamentos do associado" ON pagamentos
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM associados 
      JOIN representantes ON associados.representante_id = representantes.id 
      WHERE associados.id = pagamentos.associado_id AND representantes.user_id = auth.uid())
  );

-- Configurações
CREATE POLICY "Configuracoes visiveis publicamente" ON configuracoes
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- 7. DADOS INICIAIS
-- ============================================

-- Cidades
INSERT INTO cidades (nome, estado) VALUES 
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Salvador', 'BA'),
('Fortaleza', 'CE')
ON CONFLICT DO NOTHING;

-- Configurações
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES 
('site_nome', 'Portal COBRELIC', 'string', 'Nome do site'),
('site_descricao', 'Confederação Brasileira das Entidades e Lideranças Comunitárias', 'string', 'Descrição do site'),
('assinatura_valor', '30.00', 'number', 'Valor mensal da assinatura'),
('assinatura_trial_dias', '7', 'number', 'Dias de trial gratuito')
ON CONFLICT (chave) DO NOTHING;

-- Benefícios
INSERT INTO beneficios (titulo, descricao, icone, tipo, ordem) VALUES 
('Carteirinha Digital', 'Carteirinha digital de líder comunitário', 'credit-card', 'basico', 1),
('Telemedicina', 'Consultas médicas online 24/7', 'stethoscope', 'premium', 2),
('Clube de Descontos', 'Descontos em mais de 30 mil estabelecimentos', 'gift', 'premium', 3),
('Seguro de Vida', 'Cobertura de seguro de vida coletivo', 'shield', 'premium', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. BUCKET STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas storage
CREATE POLICY "Allow public read uploads" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'uploads');
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Allow own delete uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND owner = auth.uid());

-- ============================================
-- 9. FUNÇÃO IS_ADMIN
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM representantes 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND status_aprovacao = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PRONTO! Execute este script no SQL Editor
-- ============================================
