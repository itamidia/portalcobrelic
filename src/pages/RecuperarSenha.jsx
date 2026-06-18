import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getAuthErrorMessage } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, Mail, ChevronRight, ArrowLeft } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecuperarSenha() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('E-mail é obrigatório');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Informe um e-mail válido');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setEmailSent(true);
      toast.success('E-mail enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      if (message.includes('e-mail')) {
        setEmailError(message);
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
            Recuperar Senha
          </CardTitle>
          <CardDescription>
            {emailSent
              ? 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
              : 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                Enviamos as instruções para <strong>{email.trim()}</strong>.
                Verifique também a pasta de spam.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link to="/Login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={emailError ? 'border-red-500' : ''}
                  required
                  autoFocus
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
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
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          )}

          {!emailSent && (
            <div className="mt-6 text-center">
              <Link
                to="/Login"
                className="inline-flex items-center text-sm text-[#1e3a5f] hover:underline"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Voltar para o login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
