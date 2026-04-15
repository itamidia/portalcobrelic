import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase, Functions } from '@/api/supabaseApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, Lock, Loader2, ExternalLink } from 'lucide-react';
import BeneficioCard from '../components/associado/BeneficioCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function Beneficios() {
  const { user } = useAuth();
  const [assinando, setAssinando] = useState(false);
  const queryClient = useQueryClient();

  const { data: representante } = useQuery({
    queryKey: ['representante', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('email', user.email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const { data: associado, refetch: refetchAssociado } = useQuery({
    queryKey: ['meu-associado', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('associados')
        .select('*')
        .eq('email', user.email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const { data: beneficios, isLoading } = useQuery({
    queryKey: ['beneficios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const temAssinatura = associado?.status_assinatura === 'ativo';
  const aguardandoPagamento = associado?.status_assinatura === 'aguardando_pagamento';

  const handleAssinar = async () => {
    setAssinando(true);
    try {
      let associadoId = associado?.id;

      if (!associadoId) {
        if (!representante) {
          toast.error('Complete seu cadastro de representante antes de assinar.');
          setAssinando(false);
          return;
        }
        const { data: novoAssociado, error: createError } = await supabase
          .from('associados')
          .insert({
            nome_completo: representante.nome,
            email: representante.email,
            telefone: representante.telefone,
            cpf: representante.cpf || '',
            status_aprovacao: 'aprovado',
            status_assinatura: 'aguardando_pagamento',
          })
          .select()
          .single();
        if (createError) throw createError;
        associadoId = novoAssociado.id;
        await refetchAssociado();
      }

      await Functions.asaasCreateCustomer(associadoId);
      const resp = await Functions.asaasCreateSubscription(associadoId, 'PIX', 30.00);

      const { payment_link } = resp.data;
      await refetchAssociado();
      toast.success('Assinatura criada! Realize o pagamento para ativar.');
      if (payment_link) window.open(payment_link, '_blank');
    } catch (err) {
      toast.error('Erro ao criar assinatura: ' + (err.message || 'Tente novamente'));
    } finally {
      setAssinando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
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
              <Gift className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Benefícios do Associado</h1>
          <p className="text-white/60 text-sm">
            Aproveite todas as vantagens exclusivas
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {!temAssinatura ? (
          <Alert className="border-[#d4af37] bg-[#d4af37]/5">
            <Lock className="w-5 h-5 text-[#d4af37]" />
            <AlertDescription className="text-gray-700">
              <p className="font-semibold mb-2">Benefícios Premium</p>
              {aguardandoPagamento ? (
                <>
                  <p className="text-sm mb-3 text-amber-700">Aguardando pagamento. Clique para pagar.</p>
                  {associado?.link_pagamento && (
                    <button
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2"
                      onClick={() => window.open(associado.link_pagamento, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" /> Pagar Agora
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm mb-3">
                    Assine o plano de R$ 30/mês para ter acesso a Telemedicina e Clube de Descontos em +30 mil estabelecimentos em todo Brasil.
                  </p>
                  <button
                    className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                    onClick={handleAssinar}
                    disabled={assinando}
                  >
                    {assinando && <Loader2 className="w-4 h-4 animate-spin" />}
                    {assinando ? 'Processando...' : 'Assinar Agora'}
                  </button>
                </>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {beneficios && beneficios.length > 0 ? (
              beneficios.map((beneficio) => (
                <BeneficioCard 
                  key={beneficio.id} 
                  beneficio={beneficio} 
                  isAtivo={true} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum benefício disponível no momento</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}