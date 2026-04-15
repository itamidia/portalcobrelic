import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { associado_id } = await req.json();
    if (!associado_id) return Response.json({ error: 'associado_id é obrigatório' }, { status: 400 });

    // Buscar associado
    const associados = await base44.entities.Associado.filter({ id: associado_id });
    const associado = associados[0];
    if (!associado) return Response.json({ error: 'Associado não encontrado' }, { status: 404 });

    // Se já tem customer_id, retorna ele
    if (associado.asaas_customer_id) {
      return Response.json({ customer_id: associado.asaas_customer_id, existing: true });
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
    await base44.entities.Associado.update(associado_id, { asaas_customer_id: data.id });

    return Response.json({ customer_id: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});