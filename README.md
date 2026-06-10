# COBRELIC - Portal da Confederação Brasileira das Entidades e Lideranças Comunitárias

Portal web e PWA para gestão de associados, notificações e benefícios da COBRELIC.

## 🚀 Tecnologias

- **Frontend:** React + Vite
- **UI:** TailwindCSS + shadcn/ui
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router
- **PWA:** Service Worker + Manifest

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/itamidia/portalcobrelic.git
cd portalcobrenc

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📱 PWA - Progressive Web App

Este projeto é um PWA que pode ser instalado em dispositivos móveis:

### Android (Chrome)
1. Acesse o site no Chrome
2. Menu (3 pontos) → "Adicionar à tela inicial"
3. Confirme a instalação

### iPhone (Safari)
1. Acesse o site no Safari
2. Compartilhar (⬆️) → "Adicionar à Tela de Início"
3. Confirme

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # Componentes do painel admin
│   ├── public/         # Header, Footer públicos
│   └── ui/             # Componentes shadcn/ui
├── lib/
│   ├── AuthContext.jsx # Contexto de autenticação
│   └── supabase.js     # Cliente Supabase
├── pages/
│   ├── Admin*.jsx      # Páginas do admin
│   ├── Home.jsx        # Página inicial
│   ├── Login.jsx       # Login de usuários
│   └── ...
├── App.jsx             # Rotas principais
└── main.jsx            # Entry point
```

## 🗄️ Banco de Dados

### Scripts SQL

Execute os scripts SQL no Supabase SQL Editor:

- `add_canal_notificacoes.sql` - Adiciona coluna 'canal' na tabela notificacoes
- `add_total_destinatarios.sql` - Adiciona coluna 'total_destinatarios' na tabela notificacoes

### Principais Tabelas

- `associados` - Dados dos associados
- `notificacoes` - Sistema de notificações
- `beneficios` - Benefícios disponíveis
- `carteirinhas` - Carteirinhas digitais

## 👥 Perfis de Usuário

### Associado
- Login com email/senha
- Visualizar benefícios
- Ver notificações
- Acessar carteirinha digital

### Admin
- Gestão de associados
- Aprovação de cadastros
- Envio de notificações
- Gestão de benefícios

## 📤 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Faça upload da pasta dist
```

### Render

Conecte o repositório GitHub ao Render e configure o build command:
- Build Command: `npm run build`
- Output Directory: `dist`

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build de produção
npm run lint        # Executa ESLint
```

## 📝 Funcionalidades

- ✅ Sistema de autenticação (Supabase)
- ✅ Cadastro de associados
- ✅ Painel administrativo
- ✅ Sistema de notificações (App, Email, WhatsApp)
- ✅ Carteirinha digital
- ✅ Gestão de benefícios
- ✅ PWA instalável
- ✅ Design responsivo

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add some MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato com a equipe da COBRELIC.

