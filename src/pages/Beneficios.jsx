import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase, Functions } from '@/api/supabaseApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Lock, Loader2, ExternalLink, Package, Check, ChevronRight } from 'lucide-react';
import BeneficioCard from '../components/associado/BeneficioCard';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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

  // Buscar plano ativo do usuário
  const { data: planoAtivo, isLoading: loadingPlano } = useQuery({
    queryKey: ['plano-ativo-beneficios', associado?.plano_id],
    queryFn: async () => {
      if (!associado?.plano_id) return null;
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('id', associado.plano_id)
        .eq('ativo', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!associado?.plano_id,
  });

  // Buscar TODOS os planos disponíveis para escolha
  const { data: planosDisponiveis, isLoading: loadingPlanos } = useQuery({
    queryKey: ['planos-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar benefícios de todos os planos
  const { data: todosBeneficios } = useQuery({
    queryKey: ['todos-beneficios-planos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      return data || [];
    },
  });

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
        {/* Lista de Planos Disponíveis */}
        {loadingPlanos ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : planosDisponiveis && planosDisponiveis.length > 0 ? (
          <div className="space-y-4">
            {planosDisponiveis.map((plano) => {
              const beneficiosIds = plano.beneficios_ids || [];
              const beneficiosDoPlano = todosBeneficios?.filter(b => beneficiosIds.includes(b.id)) || [];
              const isPlanoAtual = planoAtivo?.id === plano.id;
              
              return (
                <Card 
                  key={plano.id} 
                  className={`border-0 shadow-lg overflow-hidden ${isPlanoAtual ? 'ring-2 ring-emerald-500' : ''}`}
                  style={{ borderTop: `4px solid ${plano.cor_destaque || '#1e3a5f'}` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a45] flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-lg">{plano.titulo}</h3>
                          {isPlanoAtual && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                              PLANO ATUAL
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{plano.descricao}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-gray-800">R$ {plano.valor}</span>
                      <span className="text-gray-500 text-sm">/mês</span>
                    </div>

                    {/* Lista de Benefícios do Plano */}
                    <div className="space-y-3 mb-5">
                      <p className="font-semibold text-gray-700 text-sm">Benefícios incluídos:</p>
                      {beneficiosDoPlano.length > 0 ? (
                        <div className="space-y-2">
                          {beneficiosDoPlano.slice(0, 5).map((beneficio) => (
                            <div key={beneficio.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{beneficio.titulo}</p>
                              </div>
                            </div>
                          ))}
                          {beneficiosDoPlano.length > 5 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{beneficiosDoPlano.length - 5} benefícios
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Nenhum benefício vinculado a este plano.</p>
                      )}
                    </div>

                    {/* Botão de Ação */}
                    {isPlanoAtual ? (
                      temAssinatura ? (
                        <Button 
                          variant="outline" 
                          className="w-full bg-emerald-50 border-emerald-200 text-emerald-700"
                          disabled
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Plano Ativo
                        </Button>
                      ) : aguardandoPagamento ? (
                        <Button 
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => {
                            if (plano.link_pagamento) {
                              window.open(plano.link_pagamento, '_blank');
                            } else {
                              toast.error('Link de pagamento não configurado para este plano.');
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Efetuar Pagamento
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold"
                          onClick={() => {
                            if (plano.link_pagamento) {
                              window.open(plano.link_pagamento, '_blank');
                            } else {
                              toast.error('Link de pagamento não configurado para este plano. Entre em contato com o administrador.');
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Efetuar Pagamento
                        </Button>
                      )
                    ) : (
                      <Button 
                        className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-semibold"
                        onClick={() => {
                          if (plano.link_pagamento) {
                            window.open(plano.link_pagamento, '_blank');
                          } else {
                            toast.error('Link de pagamento não configurado para este plano. Entre em contato com o administrador.');
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Efetuar Pagamento
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum plano disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}