import React, { useState, useEffect } from 'react';
import { useAuth, getAuthErrorMessage } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, Shield, Users, Award, Heart, Globe, ChevronRight, MapPin } from 'lucide-react';

const EMPTY_FORM_ERRORS = {
  email: '',
  password: '',
  confirmPassword: '',
  geral: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formErrors, setFormErrors] = useState(EMPTY_FORM_ERRORS);
  const { signIn, signUp, logout } = useAuth();

  // Verificar se deve mostrar cadastro via query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'cadastro') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const clearFormErrors = () => setFormErrors(EMPTY_FORM_ERRORS);

  const switchToLogin = () => {
    setIsSignUp(false);
    setConfirmPassword('');
    clearFormErrors();
    setSearchParams({});
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    clearFormErrors();
    setSearchParams({ tab: 'cadastro' });
  };

  const validateSignUpForm = () => {
    const errors = { ...EMPTY_FORM_ERRORS };
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'E-mail é obrigatório';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Informe um e-mail válido';
    }

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
    return !errors.email && !errors.password && !errors.confirmPassword;
  };

  const validateLoginForm = () => {
    const errors = { ...EMPTY_FORM_ERRORS };
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'E-mail é obrigatório';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Informe um e-mail válido';
    }

    if (!password) {
      errors.password = 'Senha é obrigatória';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFormErrors();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!validateSignUpForm()) {
          toast.error('Corrija os erros no formulário');
          return;
        }

        await signUp(email.trim(), password);
        await logout(false);

        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        setPassword('');
        setConfirmPassword('');
        clearFormErrors();
        switchToLogin();
        navigate('/Login', { replace: true });
      } else {
        if (!validateLoginForm()) {
          toast.error('Corrija os erros no formulário');
          return;
        }

        await signIn(email.trim(), password);
        toast.success('Login realizado com sucesso!');
        navigate('/Dashboard');
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);

      if (
        error?.code === 'user_already_exists' ||
        message.includes('já está cadastrado')
      ) {
        setFormErrors(prev => ({ ...prev, email: message }));
      } else if (message.includes('E-mail ou senha incorretos')) {
        setFormErrors(prev => ({ ...prev, geral: message }));
      } else if (message.includes('senha')) {
        setFormErrors(prev => ({ ...prev, password: message }));
      } else if (message.includes('e-mail')) {
        setFormErrors(prev => ({ ...prev, email: message }));
      } else {
        setFormErrors(prev => ({ ...prev, geral: message }));
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Info (Hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f] text-white flex-col justify-center p-12">
        <div className="max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-8">
            <img 
              src="/logo.png" 
              alt="COBRELIC" 
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Bem-vindo ao <span className="text-[#d4af37]">Portal</span>
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Acesse sua área de associado e aproveite todos os benefícios da Confederação Brasileira de Líderes Comunitários.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-8 h-8 text-[#d4af37] mb-2" />
              <div className="text-2xl font-bold">50.000+</div>
              <div className="text-sm text-white/70">Associados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MapPin className="w-8 h-8 text-[#d4af37] mb-2" />
              <div className="text-2xl font-bold">27</div>
              <div className="text-sm text-white/70">Estados</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#d4af37]" />
              </div>
              <span className="text-white/90">Benefícios exclusivos para associados</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#d4af37]" />
              </div>
              <span className="text-white/90">Reconhecimento nacional</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#d4af37]" />
              </div>
              <span className="text-white/90">Rede de líderes em todo Brasil</span>
            </div>
          </div>

          {/* Back to home */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mt-8 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Voltar para o site
          </Link>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 bg-gray-50">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
              {isSignUp ? 'Criar Conta' : 'Acessar Portal'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Preencha os dados abaixo para se associar - Será enviado um email de confirmação, é necessário confirmar clicando no link enviado!' 
                : 'Faça login para acessar sua área de líder comunitário'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formErrors.geral && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  {formErrors.geral}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className={formErrors.email ? 'border-red-500' : ''}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
                  minLength={isSignUp ? 6 : undefined}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
                  )}
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
                    onClick={switchToLogin} 
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
                    onClick={switchToSignUp} 
                    className="text-[#1e3a5f] font-medium hover:underline"
                    type="button"
                  >
                    Associe-se
                  </button>
                </>
              )}
            </div>

            {/* Mobile: Back to home */}
            <div className="lg:hidden mt-6 pt-6 border-t text-center">
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors"
              >
                ← Voltar para o site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
