// Cliente Base44 mock - redireciona para Supabase
import { 
  Representante, Associado, Beneficio, Parceiro, Cidade,
  PresidenteMunicipal, Diretoria, Noticia, Anuncio, Pagamento,
  Equipe, Notificacao, Configuracao, Functions 
} from './supabaseApi';
import { supabase, auth } from '@/lib/supabase';

// Mock do cliente base44 para compatibilidade
export const base44 = {
  entities: {
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
  },
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
      };
    },
    login: (email, password) => auth.signIn(email, password),
    logout: () => auth.signOut(),
    redirectToLogin: () => { window.location.href = '/Login'; },
  },
  functions: {
    invoke: Functions,
  },
  integrations: {
    Core: {
      InvokeLLM: null,
      SendEmail: null,
      SendSMS: null,
      UploadFile: null,
      GenerateImage: null,
      ExtractDataFromUploadedFile: null,
    }
  }
};
