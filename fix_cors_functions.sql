-- Configurar CORS para Edge Functions do Supabase
-- Adicionar configuração CORS para permitir requisições do frontend

-- Atualizar configurações CORS (se necessário)
-- Nota: Para Edge Functions, o CORS é configurado no código da função, não no banco

-- Se as funções estiverem em TypeScript, adicione este cabeçalho:
-- import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
-- 
-- E no handler da função:
-- return new Response(JSON.stringify(data), {
--   headers: {
--     "Access-Control-Allow-Origin": "*",
--     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
--     "Access-Control-Allow-Headers": "Content-Type, Authorization",
--     "Content-Type": "application/json"
--   }
-- });

-- Para desenvolvimento local, você também pode precisar configurar no Supabase Dashboard:
-- 1. Vá para Project Settings > API
-- 2. Em "Additional Redirect URLs", adicione: http://localhost:5173
-- 3. Em "Additional Headers", configure CORS se necessário
