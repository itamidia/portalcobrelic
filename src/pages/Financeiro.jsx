import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Financeiro() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [aba, setAba] = useState('pendentes');

  console.log('🚀 Financeiro component renderizado, user:', user?.id);

  // Buscar representante do usuário
  const { data: representante } = useQuery({
    queryKey: ['representante-financeiro', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Buscando representante para user_id:', user.id);
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) {
        console.error('Erro ao buscar representante:', error);
        if (error.code !== 'PGRST116') throw error;
        return null;
      }
      console.log('Representante encontrado:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar associado do representante
  const { data: associado, error: associadoError } = useQuery({
    queryKey: ['associado-financeiro', representante?.id],
    queryFn: async () => {
      if (!representante?.id) return null;
      console.log('Buscando associado para representante_id:', representante.id);
      const { data, error } = await supabase
        .from('associados')
        .select('*')
        .eq('representante_id', representante.id)
        .single();
      if (error) {
        console.error('Erro ao buscar associado:', error);
        if (error.code !== 'PGRST116') throw error;
        return null;
      }
      console.log('Associado encontrado:', data);
      return data;
    },
    enabled: !!representante?.id,
  });

  // Buscar pagamentos do associado (tabela pagamentos existente)
  const { data: pagamentos, isLoading, error: pagamentosError } = useQuery({
    queryKey: ['pagamentos', associado?.id],
    queryFn: async () => {
      if (!associado?.id) return [];
      console.log('Buscando pagamentos para associado_id:', associado.id);
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*, associado:associado_id(nome_completo)')
        .eq('associado_id', associado.id)
        .order('data_vencimento', { ascending: false });
      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }
      console.log('Pagamentos encontrados:', data);
      return data || [];
    },
    enabled: !!associado?.id,
  });

  // Mutation para pagar
  const pagarMutation = useMutation({
    mutationFn: async (pagamentoId) => {
      const { error } = await supabase
        .from('pagamentos')
        .update({ 
          status: 'pago',
          valor_pago: pagamentos.find(p => p.id === pagamentoId)?.valor,
          data_pagamento: new Date().toISOString()
        })
        .eq('id', pagamentoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      toast.success('Pagamento registrado com sucesso!');
    },
    onError: (error) => toast.error('Erro ao registrar pagamento: ' + error.message),
  });

  // Separar pagamentos por status
  const pagamentosPendentes = pagamentos?.filter(p => p.status === 'pendente' || p.status === 'atrasado') || [];
  const pagamentosPagos = pagamentos?.filter(p => p.status === 'pago') || [];

  // Calcular total pendente
  const totalPendente = pagamentosPendentes.reduce((acc, p) => acc + parseFloat(p.valor), 0);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pago':
        return { 
          label: 'Pago', 
          color: 'bg-green-100 text-green-700',
          icon: CheckCircle2,
          borderColor: 'border-green-500'
        };
      case 'pendente':
        return { 
          label: 'Pendente', 
          color: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
          borderColor: 'border-yellow-500'
        };
      case 'atrasado':
        return { 
          label: 'Atrasado', 
          color: 'bg-red-100 text-red-700',
          icon: AlertCircle,
          borderColor: 'border-red-500'
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-700',
          icon: Clock,
          borderColor: 'border-gray-500'
        };
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
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
              <Wallet className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Financeiro</h1>
          <p className="text-white/60 text-sm">
            Gerencie suas mensalidades e pagamentos
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Resumo */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pendente</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalPendente)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-500 mb-1">Pendentes</p>
                <p className="text-lg font-semibold text-yellow-600">{pagamentosPendentes.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-500 mb-1">Pagas</p>
                <p className="text-lg font-semibold text-green-600">{pagamentosPagos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <div className="flex gap-2">
          <button
            onClick={() => setAba('pendentes')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              aba === 'pendentes'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Pendentes
            {pagamentosPendentes.length > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'pendentes' ? 'bg-white/20' : 'bg-yellow-100 text-yellow-800'}`}>
                {pagamentosPendentes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAba('pagas')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
              aba === 'pagas'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Pagas
            {pagamentosPagos.length > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'pagas' ? 'bg-white/20' : 'bg-green-100 text-green-800'}`}>
                {pagamentosPagos.length}
              </span>
            )}
          </button>
        </div>

        {/* Lista de Pagamentos */}
        <div className="space-y-3">
          {aba === 'pendentes' ? (
            pagamentosPendentes.length > 0 ? (
              pagamentosPendentes.map((pagamento) => {
                const statusConfig = getStatusConfig(pagamento.status);
                const StatusIcon = statusConfig.icon;
                const isAtrasado = new Date(pagamento.data_vencimento) < new Date() && pagamento.status !== 'pago';
                
                return (
                  <Card 
                    key={pagamento.id}
                    className={`border-0 shadow-md overflow-hidden ${isAtrasado ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-yellow-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${statusConfig.color} flex items-center justify-center`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {pagamento.descricao || 'Mensalidade'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Vencimento: {format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">{formatCurrency(pagamento.valor)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color}`}>
                            {isAtrasado ? 'Atrasado' : statusConfig.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Vencimento: {format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy')}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold"
                          onClick={() => toast.info('Funcionalidade de pagamento em desenvolvimento')}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pagar
                        </Button>
                        <Button
                          variant="outline"
                          className="px-3"
                          onClick={() => toast.info('Detalhes do pagamento: ' + pagamento.id)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Nenhum pagamento pendente!</p>
                <p className="text-gray-500 text-sm mt-1">Você está em dia com seus pagamentos.</p>
              </div>
            )
          ) : (
            pagamentosPagos.length > 0 ? (
              pagamentosPagos.map((pagamento) => (
                <Card 
                  key={pagamento.id}
                  className="border-0 shadow-md border-l-4 border-l-green-500"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {pagamento.descricao || 'Mensalidade'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Vencimento: {format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">{formatCurrency(pagamento.valor)}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Pago
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Venc: {format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy')}</span>
                      </div>
                      {pagamento.data_pagamento && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Pago em: {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => toast.info('Comprovante: ' + pagamento.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Comprovante
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Nenhum pagamento registrado</p>
                <p className="text-gray-500 text-sm mt-1">Seus pagamentos aparecerão aqui.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
