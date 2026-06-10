import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function getAuthErrorMessage(error) {
  const message = (error?.message || '').toLowerCase();
  const code = error?.code || '';

  if (
    code === 'user_already_exists' ||
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already registered')
  ) {
    return 'Este e-mail já está cadastrado';
  }
  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos';
  }
  if (message.includes('valid email') || message.includes('invalid email')) {
    return 'Informe um e-mail válido';
  }
  if (message.includes('password') && (message.includes('6') || message.includes('short'))) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente';
  }

  return error?.message || 'Ocorreu um erro. Tente novamente';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [representante, setRepresentante] = useState(null);

  useEffect(() => {
    // Verificar sessão atual ao carregar
    checkUserAuth();
    
    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadRepresentante(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setRepresentante(null);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRepresentante = async (userId) => {
    console.log('🔍 loadRepresentante chamado com userId:', userId);
    try {
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📋 Sessão atual:', session ? 'Ativa' : 'Inativa');
      console.log('🔑 Token presente:', session?.access_token ? 'Sim' : 'Não');
      
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('📊 Query resultado:', { data, error: error?.message, code: error?.code });
      
      if (error) {
        console.error('❌ Erro ao carregar representante:', error);
      }
      
      setRepresentante(data || null);
      
      // Se não tem representante cadastrado, mostrar erro específico
      if (!data) {
        setAuthError({
          type: 'user_not_registered',
          message: 'Complete seu cadastro para continuar'
        });
      } else {
        setAuthError(null);
      }
    } catch (error) {
      console.error('Erro ao carregar representante:', error);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadRepresentante(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('User auth check failed:', error);
      setAuthError({
        type: 'auth_required',
        message: 'Faça login para continuar'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setRepresentante(null);
    
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Atualizar estado imediatamente para evitar redirecionamento para login
    if (data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      await loadRepresentante(data.user.id);
    }
    
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    if (error) throw error;

    // Supabase pode não retornar erro quando o e-mail já existe (por segurança)
    if (data?.user?.identities?.length === 0) {
      const duplicateError = new Error('Este e-mail já está cadastrado');
      duplicateError.code = 'user_already_exists';
      throw duplicateError;
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      representante,
      isAuthenticated, 
      isLoadingAuth,
      authError,
      logout,
      navigateToLogin,
      checkUserAuth,
      signIn,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
