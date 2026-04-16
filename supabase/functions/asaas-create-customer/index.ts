import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_SECRET');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { associado_id } = await req.json();
    if (!associado_id) return Response.json({ error: 'associado_id é obrigatório' }, { status: 400 });

    // Buscar associado
    const { data: associado, error: associadoError } = await supabase
      .from('associados')
      .select('*')
      .eq('id', associado_id)
      .single();

    if (associadoError || !associado) return Response.json({ error: 'Associado não encontrado' }, { status: 404 });

    // Se já tem customer_id, retorna ele
    if (associado.asaas_customer_id) {
      return Response.json({ customer_id: associado.asaas_customer_id, existing: true }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json"
        }
      });
    }

    // Criar cliente no Asaas
    const body = {
      name: associado.nome_completo,
      email: associado.email,
      mobilePhone: associado.telefone?.replace(/\D/g, ''),
    };
    if (associado.cpf) body.cpfCnpj = associado.cpf.replace(/\D/g, '');

    const resp = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    if (!resp.ok) return Response.json({ error: data }, { status: resp.status });

    // Salvar customer_id no associado
    const { error: updateError } = await supabase
      .from('associados')
      .update({ asaas_customer_id: data.id })
      .eq('id', associado_id);

    if (updateError) throw updateError;

    return Response.json({ customer_id: data.id }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
      }
    });
  }
});
