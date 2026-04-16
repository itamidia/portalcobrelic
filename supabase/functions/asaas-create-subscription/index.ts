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

    const { associado_id, billing_type = 'PIX', value = 30.00 } = await req.json();
    if (!associado_id) return Response.json({ error: 'associado_id é obrigatório' }, { status: 400 });

    // Buscar associado
    const { data: associado, error: associadoError } = await supabase
      .from('associados')
      .select('*')
      .eq('id', associado_id)
      .single();

    if (associadoError || !associado) return Response.json({ error: 'Associado não encontrado' }, { status: 404 });
    if (!associado.asaas_customer_id) return Response.json({ error: 'Crie o cliente no Asaas primeiro' }, { status: 400 });

    // Próxima data de vencimento (hoje + 1 dia)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split('T')[0];

    // Criar assinatura no Asaas
    const resp = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: associado.asaas_customer_id,
        billingType: billing_type,
        value,
        nextDueDate: dueDateStr,
        cycle: 'MONTHLY',
        description: 'Plano Premium COBRENC',
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return Response.json({ error: data }, { status: resp.status });

    // Buscar o link de pagamento da cobrança gerada pela assinatura
    let paymentLink = data.bankSlipUrl || data.invoiceUrl || null;

    // Se ainda não tem link, buscar a primeira cobrança da assinatura
    if (!paymentLink && data.id) {
      const paymentsResp = await fetch(`${ASAAS_API_URL}/payments?subscription=${data.id}&limit=1`, {
        headers: { 'access_token': ASAAS_API_KEY },
      });
      const paymentsData = await paymentsResp.json();
      const firstPayment = paymentsData?.data?.[0];
      paymentLink = firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null;
    }

    // Salvar subscription_id e link de pagamento
    const { error: updateError } = await supabase
      .from('associados')
      .update({
        asaas_subscription_id: data.id,
        status_assinatura: 'aguardando_pagamento',
        data_proximo_pagamento: dueDateStr,
        link_pagamento: paymentLink,
      })
      .eq('id', associado_id);

    if (updateError) throw updateError;

    return Response.json({ subscription_id: data.id, payment_link: paymentLink }, {
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
