// Re-exportar da API do Supabase para compatibilidade
export { 
  Representante, 
  Associado, 
  Beneficio, 
  Parceiro,
  Cidade,
  PresidenteMunicipal,
  Diretoria,
  Noticia,
  Anuncio,
  Pagamento,
  Equipe,
  Notificacao,
  Configuracao,
  Query 
} from './supabaseApi';

// Auth compatibilidade
export { supabase as User } from '@/lib/supabase';