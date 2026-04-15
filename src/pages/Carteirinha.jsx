import React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Share2, AlertCircle, Lock, Shield } from 'lucide-react';
import CarteirinhaDigital from '../components/associado/CarteirinhaDigital';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Carteirinha() {
  const { user } = useAuth();

  const { data: representante, isLoading } = useQuery({
    queryKey: ['carteirinha-representante', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Carteirinha ANALC',
          text: `Carteirinha de Líder Comunitário ANALC - ${representante?.nome}`,
          url: `${window.location.origin}/VerificarCarteirinha?codigo=${representante?.id}`,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    }
  };

  const carteirinhaDisponivel = representante?.ativo === true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Carteirinha Digital</h1>
          <p className="text-white/60 text-sm">
            Sua identificação como associado ANALC
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {!carteirinhaDisponivel ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Carteirinha Indisponível
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {!representante 
                  ? 'Complete seu cadastro para gerar sua carteirinha.'
                  : 'Aguardando aprovação do Presidente Municipal da sua cidade.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Carteirinha Digital */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-white/60 mb-2">ANALC - Líder Comunitário</p>
                  <p className="font-bold text-xl mb-1">{representante.nome}</p>
                  <p className="text-sm text-white/80">{representante.cargo}</p>
                </div>
                <Shield className="w-12 h-12 text-[#d4af37]" />
              </div>
              
              <div className="border-t border-white/20 pt-4 mb-4">
                <p className="text-sm text-white/80 mb-1">{representante.cidade} - {representante.estado}</p>
                <p className="text-xs text-white/60">Registro: {representante.id}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/60">Status</p>
                  <p className="text-sm font-semibold text-[#d4af37]">ATIVO</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.origin}/VerificarCarteirinha?codigo=${representante.id}`}
                    alt="QR Code"
                    className="w-20 h-20"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 border-[#1e3a5f] text-[#1e3a5f]"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Info Card */}
            <Card className="border-0 shadow-sm bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Sua carteirinha digital pode ser verificada através do QR Code por qualquer pessoa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}