import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ExternalLink, Crown, Sparkles, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function Planos() {
  const { user } = useAuth();

  // Fetch beneficios ativos
  const { data: beneficios } = useQuery({
    queryKey: ['beneficios-publicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch planos ativos
  const { data: planosData, isLoading } = useQuery({
    queryKey: ['planos-publicos'],
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

  // Combinar planos com beneficios
  const planos = planosData?.map(plano => {
    const beneficiosIds = plano.beneficios_ids || [];
    const beneficiosDoPlano = beneficios?.filter(b => beneficiosIds.includes(b.id)) || [];
    return {
      ...plano,
      beneficios: beneficiosDoPlano
    };
  }) || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const handleAssinar = (plano) => {
    if (!user) {
      toast.error('Faça login para assinar um plano');
      return;
    }

    if (!plano.link_pagamento) {
      toast.error('Link de pagamento não configurado para este plano');
      return;
    }

    // Abre link de pagamento em nova aba
    window.open(plano.link_pagamento, '_blank');
    toast.success('Redirecionando para pagamento...');
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
      {/* Header - Layout mobile igual Dashboard/Beneficios */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Escolha seu Plano</h1>
          <p className="text-white/60 text-sm">
            Associe-se ao COBRENC e tenha acesso a benefícios exclusivos
          </p>
        </div>
      </div>

      {/* Lista de Planos - Layout mobile */}
      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {planos?.length > 0 ? (
          planos.map((plano) => (
            <Card 
              key={plano.id} 
              className="border-0 shadow-lg overflow-hidden"
              style={{ borderTop: `4px solid ${plano.cor_destaque || '#1e3a5f'}` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a45] flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{plano.titulo}</h3>
                    <p className="text-sm text-gray-500">{plano.descricao}</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-800">{formatCurrency(plano.valor)}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>

                {/* Benefícios */}
                <div className="space-y-3 mb-5">
                  <p className="font-semibold text-gray-700 text-sm">Benefícios incluídos:</p>
                  <div className="space-y-2">
                    {plano.beneficios?.length > 0 ? (
                      plano.beneficios.slice(0, 5).map((beneficio, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-gray-700 text-sm">{beneficio?.titulo}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Benefícios em breve</p>
                    )}
                    {plano.beneficios?.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{plano.beneficios.length - 5} benefícios
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão */}
                <Button
                  onClick={() => handleAssinar(plano)}
                  className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold h-12"
                  disabled={!plano.link_pagamento}
                >
                  {plano.link_pagamento ? (
                    <>
                      Efetuar Pagamento
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Em breve'
                  )}
                </Button>

                {!plano.link_pagamento && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Pagamento indisponível no momento
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum plano disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
