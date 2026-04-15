import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { associado_id, billing_type = 'PIX', value = 30.00 } = await req.json();
    if (!associado_id) return Response.json({ error: 'associado_id é obrigatório' }, { status: 400 });

    // Buscar associado
    const associados = await base44.entities.Associado.filter({ id: associado_id });
    const associado = associados[0];
    if (!associado) return Response.json({ error: 'Associado não encontrado' }, { status: 404 });
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
    await base44.entities.Associado.update(associado_id, {
      asaas_subscription_id: data.id,
      status_assinatura: 'aguardando_pagamento',
      data_proximo_pagamento: dueDateStr,
      link_pagamento: paymentLink,
    });

    return Response.json({ subscription_id: data.id, payment_link: paymentLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});