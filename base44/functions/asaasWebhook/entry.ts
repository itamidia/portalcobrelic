import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    // Validar que veio do Asaas via header
    const asaasToken = req.headers.get('asaas-access-token');
    const expectedToken = Deno.env.get('ASAAS_API_KEY');
    if (!asaasToken || asaasToken !== expectedToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { event, payment } = payload;

    if (!event || !payment) {
      return Response.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Buscar associado pelo asaas_customer_id
    const associados = await base44.asServiceRole.entities.Associado.filter({
      asaas_customer_id: payment.customer,
    });
    const associado = associados[0];

    if (!associado) {
      console.log(`Associado não encontrado para customer: ${payment.customer}`);
      return Response.json({ received: true });
    }

    // Mapear evento para ação
    const statusMap = {
      PAYMENT_RECEIVED:  { status_assinatura: 'ativo' },
      PAYMENT_CONFIRMED: { status_assinatura: 'ativo' },
      PAYMENT_OVERDUE:   { status_assinatura: 'atrasado' },
      PAYMENT_DELETED:   { status_assinatura: 'cancelado' },
      SUBSCRIPTION_DELETED: { status_assinatura: 'cancelado' },
    };

    if (statusMap[event]) {
      const update = { ...statusMap[event] };

      // Se pagamento confirmado, salvar data do próximo vencimento
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        if (payment.dueDate) {
          // Próximo vencimento = um mês após o vencimento atual
          const next = new Date(payment.dueDate);
          next.setMonth(next.getMonth() + 1);
          update.data_proximo_pagamento = next.toISOString().split('T')[0];
          update.data_primeiro_pagamento = update.data_primeiro_pagamento || payment.dueDate;
        }
      }

      await base44.asServiceRole.entities.Associado.update(associado.id, update);

      // Registrar pagamento na entidade Pagamento
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        await base44.asServiceRole.entities.Pagamento.create({
          associado_id: associado.id,
          asaas_payment_id: payment.id,
          valor: payment.value,
          data_vencimento: payment.dueDate,
          data_pagamento: payment.paymentDate || new Date().toISOString().split('T')[0],
          status: 'confirmado',
          metodo_pagamento: payment.billingType === 'PIX' ? 'pix' : payment.billingType === 'BOLETO' ? 'boleto' : 'cartao',
          descricao: `Pagamento Plano Premium - ${event}`,
        });
      }

      if (event === 'PAYMENT_OVERDUE') {
        await base44.asServiceRole.entities.Pagamento.create({
          associado_id: associado.id,
          asaas_payment_id: payment.id,
          valor: payment.value,
          data_vencimento: payment.dueDate,
          status: 'atrasado',
          descricao: `Pagamento atrasado - ${event}`,
        });
      }
    }

    return Response.json({ received: true, event });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});