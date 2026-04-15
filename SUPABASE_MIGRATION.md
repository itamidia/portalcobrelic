# Migração Base44 → Supabase - Portal COBRELIC

## Resumo

Este projeto foi migrado da plataforma Base44 para o Supabase. Todas as configurações estão prontas para uso.

---

## Credenciais do Supabase

- **Project URL:** `https://mjhqqezlynrriksckxxh.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHFxZXpseW5ycmlrc2NreHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTM4MTcsImV4cCI6MjA5MTc4OTgxN30.vHiBf1I4zySY9XTygn07v1ZvpKmiWBqcOj1Vt_Q3-Bc`

---

## Configuração do Ambiente

O arquivo `.env` já foi criado com as variáveis necessárias.

---

## Variáveis de Ambiente das Edge Functions

Você precisa configurar estas variáveis no painel do Supabase:

### 1. Acesse o painel do Supabase
URL: https://supabase.com/dashboard/project/mjhqqezlynrriksckxxh

### 2. Vá em: Project Settings → Functions → Environment Variables

### 3. Adicione estas variáveis:

```
ASAAS_API_KEY=sua_chave_api_asaas_aqui
ASAAS_WEBHOOK_TOKEN=token_para_webhook_asaas
```

### Como obter sua chave do Asaas:
1. Acesse https://sandbox.asaas.com/ (ambiente de teste) ou https://app.asaas.com/ (produção)
2. Vá em: Conta → Integrações → API
3. Copie sua API Key

### Configurar Webhook no Asaas:
URL do webhook: `https://mjhqqezlynrriksckxxh.supabase.co/functions/v1/asaas-webhook`

Header obrigatório:
```
asaas-access-token: SUA_API_KEY_ASAAS
```

Eventos para ativar:
- ✅ PAYMENT_RECEIVED (Pagamento recebido)
- ✅ PAYMENT_CONFIRMED (Pagamento confirmado)
- ✅ PAYMENT_OVERDUE (Pagamento atrasado)
- ✅ PAYMENT_DELETED (Pagamento deletado)
- ✅ SUBSCRIPTION_DELETED (Assinatura deletada)

---

## Edge Functions Criadas

1. **`asaas-create-customer`** - Cria cliente no Asaas
   - URL: `https://mjhqqezlynrriksckxxh.supabase.co/functions/v1/asaas-create-customer`

2. **`asaas-create-subscription`** - Cria assinatura no Asaas
   - URL: `https://mjhqqezlynrriksckxxh.supabase.co/functions/v1/asaas-create-subscription`

3. **`asaas-webhook`** - Recebe webhooks do Asaas
   - URL: `https://mjhqqezlynrriksckxxh.supabase.co/functions/v1/asaas-webhook`

---

## Tabelas Criadas no Banco

- `representantes` - Líderes comunitários
- `associados` - Usuários com assinatura premium
- `beneficios` - Benefícios disponíveis
- `parceiros` - Parceiros do clube de descontos
- `pagamentos` - Histórico de pagamentos
- `cidades` - Cidades cadastradas
- `presidentes_municipais` - Presidentes municipais
- `diretoria` - Membros da diretoria nacional
- `noticias` - Notícias do portal
- `anuncios` - Anúncios/Propagandas
- `equipe` - Equipe municipal
- `notificacoes` - Notificações para usuários
- `configuracoes` - Configurações do sistema

---

## Autenticação

O sistema agora usa **Supabase Auth**:

- Login com email/senha
- SignUp com confirmação automática
- Sessões persistentes
- Logout automático

---

## O que foi alterado no código

### Novos arquivos:
- `.env` - Variáveis de ambiente
- `src/lib/supabase.js` - Cliente Supabase
- `src/api/supabaseApi.js` - API compatível com Base44
- `src/pages/Login.jsx` - Página de login

### Arquivos modificados:
- `src/lib/AuthContext.jsx` - Autenticação via Supabase
- `src/App.jsx` - Rotas protegidas
- `src/pages.config.js` - Adicionada rota Login
- `package.json` - Adicionado `@supabase/supabase-js`

---

## Para rodar o projeto

```bash
npm install  # já foi executado
npm run dev
```

---

## Webhook do Asaas

Configure no painel do Asaas o webhook para:
```
https://mjhqqezlynrriksckxxh.supabase.co/functions/v1/asaas-webhook
```

Com header:
```
asaas-access-token: SUA_CHAVE_API_ASAAS
```

Eventos necessários:
- PAYMENT_RECEIVED
- PAYMENT_CONFIRMED
- PAYMENT_OVERDUE
- PAYMENT_DELETED
- SUBSCRIPTION_DELETED

---

## Próximos passos

1. [ ] Configurar variáveis de ambiente das Edge Functions no painel Supabase
2. [ ] Configurar webhook no painel do Asaas
3. [ ] Adicionar políticas RLS para acesso admin (se necessário)
4. [ ] Adaptar páginas Admin* para usar a nova API
5. [ ] Testar fluxo de cadastro e pagamento

---

## Suporte

- Dashboard Supabase: https://supabase.com/dashboard/project/mjhqqezlynrriksckxxh
- Documentação Supabase: https://supabase.com/docs
