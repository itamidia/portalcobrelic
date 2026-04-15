// API simplificada usando Supabase
import { supabase, query, create, update, remove, invokeFunction } from '@/lib/supabase';

// Representantes
export const Representante = {
  filter: (filters = {}, orderBy, limit) => 
    query('representantes', { filter: filters, order: orderBy ? { column: orderBy, ascending: true } : null, limit }),
  
  getById: (id) => 
    query('representantes', { eq: ['id', id], single: true }),
  
  create: (data) => create('representantes', data),
  
  update: (id, data) => update('representantes', id, data),
  
  delete: (id) => remove('representantes', id),
  
  getByUserId: (userId) => 
    query('representantes', { eq: ['user_id', userId], single: true }),
};

// Associados
export const Associado = {
  filter: (filters = {}, orderBy, limit) => 
    query('associados', { filter: filters, order: orderBy ? { column: orderBy, ascending: true } : null, limit }),
  
  getById: (id) => 
    query('associados', { eq: ['id', id], single: true }),
  
  create: (data) => create('associados', data),
  
  update: (id, data) => update('associados', id, data),
  
  delete: (id) => remove('associados', id),
  
  getByRepresentante: (representanteId) => 
    query('associados', { eq: ['representante_id', representanteId], single: true }),
};

// Benefícios
export const Beneficio = {
  filter: (filters = {}, orderBy, limit) => 
    query('beneficios', { filter: { ...filters, ativo: true }, order: orderBy ? { column: orderBy, ascending: true } : null, limit }),
  
  getById: (id) => 
    query('beneficios', { eq: ['id', id], single: true }),
  
  getAll: () => 
    query('beneficios', { filter: { ativo: true }, order: { column: 'ordem', ascending: true } }),
};

// Parceiros
export const Parceiro = {
  filter: (filters = {}) => 
    query('parceiros', { filter: { ...filters, ativo: true }, order: { column: 'ordem', ascending: true } }),
  
  getByCidade: (cidade, estado) => 
    query('parceiros', { filter: { cidade, estado, ativo: true } }),
  
  getAll: () => 
    query('parceiros', { filter: { ativo: true }, order: { column: 'nome', ascending: true } }),
};

// Cidades
export const Cidade = {
  filter: (filters = {}) => 
    query('cidades', { filter: filters, order: { column: 'nome', ascending: true } }),
  
  getById: (id) => 
    query('cidades', { eq: ['id', id], single: true }),
  
  getAll: () => 
    query('cidades', { order: { column: 'nome', ascending: true } }),
};

// Presidentes Municipais
export const PresidenteMunicipal = {
  filter: (filters = {}) => 
    query('presidentes_municipais', { filter: filters }),
  
  getById: (id) => 
    query('presidentes_municipais', { eq: ['id', id], single: true }),
  
  getAprovados: () => 
    query('presidentes_municipais', { filter: { status: 'aprovado', ativo: true } }),
  
  create: (data) => create('presidentes_municipais', data),
  
  update: (id, data) => update('presidentes_municipais', id, data),
};

// Diretoria
export const Diretoria = {
  filter: (filters = {}) => 
    query('diretoria', { filter: { ...filters, ativo: true }, order: { column: 'ordem', ascending: true } }),
  
  getAll: () => 
    query('diretoria', { filter: { ativo: true }, order: { column: 'ordem', ascending: true } }),
};

// Notícias
export const Noticia = {
  filter: (filters = {}, orderBy, limit) => 
    query('noticias', { filter: { ...filters, ativo: true }, order: orderBy ? { column: orderBy, ascending: false } : { column: 'publicado_em', ascending: false }, limit }),
  
  getById: (id) => 
    query('noticias', { eq: ['id', id], single: true }),
  
  getDestaques: () => 
    query('noticias', { filter: { destaque: true, ativo: true }, order: { column: 'publicado_em', ascending: false }, limit: 5 }),
  
  getAll: () => 
    query('noticias', { filter: { ativo: true }, order: { column: 'publicado_em', ascending: false } }),
};

// Anúncios
export const Anuncio = {
  filter: (filters = {}) => 
    query('anuncios', { filter: { ...filters, ativo: true }, order: { column: 'ordem', ascending: true } }),
  
  getByPosicao: (posicao) => 
    query('anuncios', { filter: { posicao, ativo: true }, order: { column: 'ordem', ascending: true } }),
};

// Pagamentos
export const Pagamento = {
  filter: (filters = {}) => 
    query('pagamentos', { filter: filters, order: { column: 'created_at', ascending: false } }),
  
  getByAssociado: (associadoId) => 
    query('pagamentos', { eq: ['associado_id', associadoId], order: { column: 'data_vencimento', ascending: false } }),
  
  create: (data) => create('pagamentos', data),
};

// Equipe
export const Equipe = {
  filter: (filters = {}) => 
    query('equipe', { filter: { ...filters, ativo: true }, order: { column: 'ordem', ascending: true } }),
  
  getByCidade: (cidadeId) => 
    query('equipe', { eq: ['cidade_id', cidadeId] }),
};

// Notificações
export const Notificacao = {
  filter: (filters = {}) => 
    query('notificacoes', { filter: filters, order: { column: 'created_at', ascending: false } }),
  
  getNaoLidas: (destinatarioId) => 
    query('notificacoes', { filter: { destinatario_id: destinatarioId, lida: false } }),
  
  marcarComoLida: (id) => update('notificacoes', id, { lida: true, data_leitura: new Date().toISOString() }),
};

// Configurações
export const Configuracao = {
  get: (chave) => 
    query('configuracoes', { eq: ['chave', chave], single: true }),
  
  getAll: () => 
    query('configuracoes'),
};

// Funções (Edge Functions)
export const Functions = {
  asaasCreateCustomer: (associadoId) => 
    invokeFunction('asaas-create-customer', { associado_id: associadoId }),
  
  asaasCreateSubscription: (associadoId, billingType = 'PIX', value = 30.00) => 
    invokeFunction('asaas-create-subscription', { associado_id: associadoId, billing_type: billingType, value }),
};

// Query genérica (compatibilidade com base44)
export const Query = {
  custom: async (table, options = {}) => {
    let q = supabase.from(table).select(options.select || '*');
    
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        q = q.eq(key, value);
      });
    }
    
    if (options.order) {
      const { column, ascending = true } = options.order;
      q = q.order(column, { ascending });
    }
    
    if (options.limit) {
      q = q.limit(options.limit);
    }
    
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
};

// Auth export (para compatibilidade)
export { supabase };
