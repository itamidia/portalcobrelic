import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth, getAuthErrorMessage } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, KeyRound, ChevronRight } from 'lucide-react';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const { updatePassword, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const isRecoveryHash = () => {
      const hash = window.location.hash.substring(1);
      if (!hash) return false;
      return new URLSearchParams(hash).get('type') === 'recovery';
    };

    if (isRecoveryHash()) {
      setIsValidSession(true);
      setCheckingSession(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    });

    const timeout = setTimeout(() => setCheckingSession(false), 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const validateForm = () => {
    const errors = { password: '', confirmPassword: '' };

    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'A confirmação de senha deve ser igual à senha';
    }

    setFormErrors(errors);
    return !errors.password && !errors.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      await logout(false);
      toast.success('Senha redefinida com sucesso! Faça login com sua nova senha.');
      navigate('/Login', { replace: true });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-[#1e3a5f]">
              Link inválido ou expirado
            </CardTitle>
            <CardDescription>
              Solicite um novo link de recuperação de senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#152a45]">
              <Link to="/RecuperarSenha">Solicitar novo link</Link>
            </Button>
            <div className="text-center">
              <Link
                to="/Login"
                className="inline-flex items-center text-sm text-[#1e3a5f] hover:underline"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-gray-50">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <img
            src="/logo.png"
            alt="COBRELIC"
            className="h-16 w-auto object-contain"
          />
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
            Nova Senha
          </CardTitle>
          <CardDescription>
            Digite e confirme sua nova senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) {
                    setFormErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                className={formErrors.password ? 'border-red-500' : ''}
                required
                minLength={6}
                autoFocus
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) {
                    setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={formErrors.confirmPassword ? 'border-red-500' : ''}
                required
                minLength={6}
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
