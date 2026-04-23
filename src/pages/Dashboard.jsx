import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase, Functions } from '@/api/supabaseApi';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  CreditCard, 
  Gift, 
  ChevronRight, 
  Shield,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '../components/ui/StatusBadge';
import CarteirinhaDigital from '../components/associado/CarteirinhaDigital';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, representante: representanteAuth } = useAuth();
  const [assinando, setAssinando] = useState(false);

  const { data: representanteDb, isLoading } = useQuery({
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
  
  const representante = representanteDb || representanteAuth;

  // Fetch plano ativo do usuário (se tiver assinatura)
  const { data: planoAtivo } = useQuery({
    queryKey: ['plano-ativo', representante?.id],
    queryFn: async () => {
      if (!representante?.plano_id) return null;
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('id', representante.plano_id)
        .eq('ativo', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!representante?.plano_id,
  });

  const { data: beneficios } = useQuery({
    queryKey: ['beneficios-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .limit(2);
      if (error) throw error;
      return data;
    },
  });

  // Buscar associado vinculado ao usuário para status da assinatura
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const isAprovado = representante?.status_aprovacao === 'aprovado';
  const temAssinatura = associado?.status_assinatura === 'ativo';

  const handleAssinar = async () => {
    setAssinando(true);
    try {
      let associadoId = associado?.id;

      // Se não tem associado, criar automaticamente com dados do representante
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

      // 1. Criar cliente no Asaas (se não existir)
      await Functions.asaasCreateCustomer(associadoId);

      // 2. Criar assinatura PIX
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="https://media.base44.com/images/public/693099089062f3cc56b4fd72/9668af615_Designsemnome-2026-03-18T114619559.png"
              alt="COBRELIC"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">
            Olá, {representante?.nome?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Líder'}!
          </h1>
          <p className="text-white/60 text-sm">
            {isAprovado ? 'Líder Comunitário Ativo' : 'Cadastro em Análise'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Status Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Status do Cadastro</h3>
              {isAprovado ? (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  ✓ Aprovado
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  ⏳ Em Análise
                </div>
              )}
            </div>

            {!isAprovado && (
              <div className="p-3 bg-amber-50 rounded-xl mb-3">
                <p className="text-xs text-amber-800">
                  Seu cadastro está sendo analisado pelo Presidente Municipal da sua cidade. 
                  Você será notificado quando for aprovado.
                </p>
              </div>
            )}

            {representante?.id && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Shield className="w-5 h-5 text-[#1e3a5f]" />
                <div>
                  <p className="text-xs text-gray-500">Número de Registro</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {representante.id}
                  </p>
                </div>
              </div>
            )}

            {!representante && (
              <div className="text-center py-4">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm mb-3">
                  Complete seu cadastro para se tornar um Líder Comunitário
                </p>
                <Link to={createPageUrl('Cadastro')}>
                  <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                    Completar Cadastro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plano Premium - Dinâmico */}
        {isAprovado && (
          <Card className={`shadow-lg border-0 ${temAssinatura ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5'}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${temAssinatura ? 'bg-green-100' : 'bg-[#d4af37]/20'}`}>
                  {temAssinatura ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Package className="w-5 h-5 text-[#d4af37]" />}
                </div>
                <div className="flex-1">
                  {temAssinatura && planoAtivo ? (
                    <>
                      <h3 className="font-semibold text-green-800 mb-1">Seu plano atual é {planoAtivo.titulo} ✓</h3>
                      <p className="text-sm text-green-700">
                        {planoAtivo.descricao?.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-semibold text-green-800">
                          R$ {planoAtivo.valor}/mês
                        </span>
                      </div>
                      {associado?.data_proximo_pagamento && (
                        <p className="text-xs text-green-600 mt-2">
                          Próximo vencimento: {format(new Date(associado.data_proximo_pagamento), 'dd/MM/yyyy')}
                        </p>
                      )}
                      <Link to="/Beneficios" className="block mt-3">
                        <Button variant="outline" className="w-full text-sm">
                          Ver meus benefícios <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-800 mb-1">Escolher Plano</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Escolha o plano ideal para você e tenha acesso a benefícios exclusivos.
                      </p>
                      <Link to="/Planos">
                        <Button className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold">
                          <Package className="w-4 h-4 mr-2" />
                          Ver Planos
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl('Carteirinha')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Carteirinha</p>
                  <p className="text-xs text-gray-500">Digital</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Beneficios')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Benefícios</p>
                  <p className="text-xs text-gray-500">Exclusivos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Mini Carteirinha Preview */}
        {representante && isAprovado && (
          <div>
            <h3 className="text-gray-700 font-semibold mb-3">Sua Carteirinha</h3>
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">COBRELIC - Líder Comunitário</p>
                  <p className="font-bold text-lg">{representante.nome}</p>
                </div>
                <Shield className="w-8 h-8 text-[#d4af37]" />
              </div>
              <div className="text-sm text-white/80">
                <p>{representante.cidade} - {representante.estado}</p>
                <p className="text-xs text-white/60 mt-2">Registro: {representante.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Institutional Text */}
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-[#1e3a5f] flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 text-sm leading-relaxed">
                A COBRELIC — Confederação Brasileira das Entidades e Lideranças Comunitárias — existe para garantir apoio, 
                assistência e benefícios sociais acessíveis para famílias de todo o Brasil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}