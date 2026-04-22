import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_SECRET');

serve(async (req) => {
  console.log('=== asaas-create-customer iniciado ===');
  
  try {
    const { associado_id } = await req.json();
    console.log('associado_id recebido:', associado_id);
    
    if (!associado_id) {
      return new Response(JSON.stringify({ error: 'associado_id é obrigatório' }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
          "Content-Type": "application/json"
        }
      });
    }
    
    // Buscar configurações do Asaas
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: configData, error: configError } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'asaas_token')
      .single();
    
    console.log('Configuração asaas_token:', { configData, configError });
    
    const asaasToken = configData?.valor || Deno.env.get('ASAAS_API_KEY');
    
    if (!asaasToken) {
      return new Response(JSON.stringify({ 
        error: 'Token do Asaas não configurado',
        details: 'Configure o asaas_token na tabela configuracoes ou a variável de ambiente ASAAS_API_KEY'
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
          "Content-Type": "application/json"
        }
      });
    }
    
    // Buscar dados do associado
    const { data: associado, error: associadoError } = await supabase
      .from('associados')
      .select('*')
      .eq('id', associado_id)
      .single();
    
    if (associadoError || !associado) {
      return new Response(JSON.stringify({ error: 'Associado não encontrado' }), {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
          "Content-Type": "application/json"
        }
      });
    }
    
    console.log('Associado encontrado:', associado.nome_completo);
    
    // Se já tem customer_id, retorna ele
    if (associado.asaas_customer_id) {
      return new Response(JSON.stringify({ 
        customer_id: associado.asaas_customer_id, 
        existing: true 
      }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
          "Content-Type": "application/json"
        }
      });
    }
    
    // Criar cliente no Asaas
    const asaasBody = {
      name: associado.nome_completo,
      email: associado.email,
      mobilePhone: associado.telefone?.replace(/\D/g, ''),
    };
    
    if (associado.cpf) {
      asaasBody.cpfCnpj = associado.cpf.replace(/\D/g, '');
    }
    
    console.log('Criando cliente no Asaas:', asaasBody);
    
    const asaasResp = await fetch('https://api.asaas.com/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasToken,
      },
      body: JSON.stringify(asaasBody),
    });
    
    const asaasData = await asaasResp.json();
    console.log('Resposta Asaas:', asaasData);
    
    if (!asaasResp.ok) {
      return new Response(JSON.stringify({ 
        error: 'Erro ao criar cliente no Asaas',
        details: asaasData
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
          "Content-Type": "application/json"
        }
      });
    }
    
    // Salvar customer_id no associado
    const { error: updateError } = await supabase
      .from('associados')
      .update({ asaas_customer_id: asaasData.id })
      .eq('id', associado_id);
    
    if (updateError) {
      console.log('Erro ao atualizar associado:', updateError);
    }
    
    return new Response(JSON.stringify({
      success: true,
      customer_id: asaasData.id,
      message: 'Customer criado com sucesso'
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.log('Erro:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        "Content-Type": "application/json"
      }
    });
  }
});
