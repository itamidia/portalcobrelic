import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres');
          setIsLoading(false);
          return;
        }
        await signUp(email, password);
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        toast.success('Login realizado com sucesso!');
        navigate('/Dashboard');
      }
    } catch (error) {
      toast.error('Erro: ' + (error.message || 'Verifique suas credenciais'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#152a45] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
            Portal COBRELIC
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie sua conta para começar' : 'Faça login para acessar sua área de líder comunitário'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                isSignUp ? 'Criar Conta' : 'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Já tem uma conta?{' '}
                <button 
                  onClick={() => setIsSignUp(false)} 
                  className="text-[#1e3a5f] font-medium hover:underline"
                  type="button"
                >
                  Faça login
                </button>
              </>
            ) : (
              <>
                Ainda não tem conta?{' '}
                <button 
                  onClick={() => setIsSignUp(true)} 
                  className="text-[#1e3a5f] font-medium hover:underline"
                  type="button"
                >
                  Crie uma conta
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
