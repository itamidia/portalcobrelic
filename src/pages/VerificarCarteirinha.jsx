import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerificarCarteirinha() {
  const urlParams = new URLSearchParams(window.location.search);
  const codigo = urlParams.get('codigo');

  const { data: associado, isLoading, isError } = useQuery({
    queryKey: ['verificar-carteirinha', codigo],
    queryFn: async () => {
      if (!codigo) return null;
      const result = await base44.entities.Associado.filter({ codigo_carteirinha: codigo });
      return result[0] || null;
    },
    enabled: !!codigo,
  });

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getStatusConfig = (status) => {
    const configs = {
      ativo: {
        icon: CheckCircle,
        label: 'REGULAR',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgLight: 'bg-emerald-50',
      },
      aguardando_pagamento: {
        icon: Clock,
        label: 'AGUARDANDO PAGAMENTO',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgLight: 'bg-amber-50',
      },
      atrasado: {
        icon: AlertTriangle,
        label: 'INADIMPLENTE',
        bgColor: 'bg-red-500',
        textColor: 'text-red-700',
        bgLight: 'bg-red-50',
      },
      cancelado: {
        icon: XCircle,
        label: 'CANCELADO',
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgLight: 'bg-gray-50',
      },
    };
    return configs[status] || configs.aguardando_pagamento;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!codigo || !associado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Carteirinha Não Encontrada</h2>
            <p className="text-gray-500">
              O código informado não corresponde a nenhuma carteirinha válida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(associado.status_assinatura);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#152a45] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-9 h-9 text-[#d4af37]" />
          </div>
          <h1 className="text-white text-xl font-bold">ANALC</h1>
          <p className="text-white/60 text-sm">Verificação de Carteirinha</p>
        </div>

        {/* Verification Card */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Status Header */}
          <div className={`${statusConfig.bgColor} p-4`}>
            <div className="flex items-center justify-center gap-2 text-white">
              <StatusIcon className="w-6 h-6" />
              <span className="font-bold text-lg">{statusConfig.label}</span>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Associate Info */}
            <div className="space-y-4">
              <div className="text-center pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{associado.nome_completo}</h2>
                <p className="text-gray-500 text-sm">Associado ANALC</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">CPF</p>
                  <p className="font-semibold text-gray-800">{formatCPF(associado.cpf)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Código</p>
                  <p className="font-mono font-bold text-[#1e3a5f]">{associado.codigo_carteirinha}</p>
                </div>
              </div>

              <div className={`${statusConfig.bgLight} rounded-xl p-4 mt-4`}>
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-8 h-8 ${statusConfig.textColor}`} />
                  <div>
                    <p className={`font-semibold ${statusConfig.textColor}`}>
                      {associado.status_assinatura === 'ativo' 
                        ? 'Mensalidade em dia' 
                        : associado.status_assinatura === 'atrasado'
                          ? 'Mensalidade em atraso'
                          : associado.status_assinatura === 'cancelado'
                            ? 'Associação cancelada'
                            : 'Aguardando pagamento'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Verificado em {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Associação Nacional de Apoio Legal e Comunitário
        </p>
      </div>
    </div>
  );
}