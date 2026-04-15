import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Buscar representante e verificar se é admin
        const { data: representante } = await supabase
          .from('representantes')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (representante?.role === 'admin') {
          navigate('/admin');
        } else {
          // Não é admin, fazer logout
          await supabase.auth.signOut();
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Fazer login com email/senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se é admin
      const { data: representante, error: repError } = await supabase
        .from('representantes')
        .select('role')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (repError) throw repError;

      if (representante?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Você não tem permissão de administrador.');
      }

      toast.success('Login realizado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro login:', error);
      toast.error('Erro ao fazer login: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#152a45] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#152a45] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/693099089062f3cc56b4fd72/9668af615_Designsemnome-2026-03-18T114619559.png"
            alt="COBRELIC"
            className="h-20 w-auto object-contain mx-auto mb-4 brightness-0 invert"
          />
          <p className="text-white/60 text-sm mt-1">Painel Administrativo</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Acesso Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] h-12"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-4">
              Acesso restrito a administradores do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}