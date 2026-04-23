import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, MapPin, Info, Heart, CreditCard, Shield, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import QuemSomosModal from '../components/public/QuemSomosModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RadioPlayer from '../components/public/RadioPlayer';
import AnunciosCarousel from '../components/public/AnunciosCarousel';
import FotoBanner from '../components/public/FotoBanner';
import NoticiasSection from '../components/public/NoticiasSection';

// Marca a página como pública
Associados.public = true;

export default function Associados() {
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [cidadeFiltro, setCidadeFiltro] = useState('todos');
  const [showQuemSomos, setShowQuemSomos] = useState(false);
  const [registroBusca, setRegistroBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const { data: associados = [], isLoading } = useQuery({
    queryKey: ['associados-publico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('associados')
        .select('*, representantes!inner(estado, cidade)')
        .eq('status_aprovacao', 'aprovado');
      if (error) throw error;
      return data || [];
    },
  });

  // Extrair estados únicos
  const estados = useMemo(() => {
    if (!associados || !Array.isArray(associados)) return [];
    const uniqueEstados = [...new Set(associados.map(a => a.representantes?.estado))].filter(Boolean);
    return uniqueEstados.sort();
  }, [associados]);

  // Extrair cidades do estado selecionado
  const cidades = useMemo(() => {
    if (!associados || !Array.isArray(associados) || estadoFiltro === 'todos') return [];
    const cidadesDoEstado = associados
      .filter(a => a.representantes?.estado === estadoFiltro)
      .map(a => a.representantes?.cidade);
    return [...new Set(cidadesDoEstado)].filter(Boolean).sort();
  }, [associados, estadoFiltro]);

  // Filtrar associados
  const associadosFiltrados = useMemo(() => {
    if (!associados || !Array.isArray(associados)) return [];
    const filtered = associados.filter(a => {
      const matchEstado = estadoFiltro === 'todos' || a.representantes?.estado === estadoFiltro;
      const matchCidade = cidadeFiltro === 'todos' || a.representantes?.cidade === cidadeFiltro;
      const matchStatus = statusFiltro === 'todos' || a.status_assinatura === statusFiltro;
      const matchRegistro = !registroBusca || a.id?.toLowerCase().includes(registroBusca.toLowerCase()) || 
        a.nome_completo?.toLowerCase().includes(registroBusca.toLowerCase());
      return matchEstado && matchCidade && matchStatus && matchRegistro;
    });
    
    return filtered;
  }, [associados, estadoFiltro, cidadeFiltro, statusFiltro, registroBusca]);

  // Reset cidade quando muda o estado
  const handleEstadoChange = (value) => {
    setEstadoFiltro(value);
    setCidadeFiltro('todos');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white pt-8 pb-12 px-4 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-10 w-64 bg-white/20 mb-2" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal Quem Somos */}
      <QuemSomosModal open={showQuemSomos} onOpenChange={setShowQuemSomos} />

      {/* Header */}
      <div className="bg-white pt-8 pb-16 px-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://media.base44.com/images/public/693099089062f3cc56b4fd72/9668af615_Designsemnome-2026-03-18T114619559.png" 
                alt="COBRELIC"
                className="h-48 w-auto object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowQuemSomos(true)}
                variant="outline"
                size="sm"
                className="bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f]/20 hover:text-[#1e3a5f]"
              >
                <Info className="w-4 h-4 mr-2" />
                Quem Somos
              </Button>
              <Link to={createPageUrl('Representantes')}>
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f]/20 hover:text-[#1e3a5f]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Representantes
                </Button>
              </Link>
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                variant="outline"
                size="sm"
                className="bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f]/20 hover:text-[#1e3a5f]"
              >
                Fazer Login
              </Button>
              <Link to={createPageUrl('Cadastro')}>
                <Button 
                  size="sm"
                  className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Associar-se
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Banner rotativo de fotos */}
        <FotoBanner />

        {/* Estatísticas dos Associados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f]">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{associados.length}</p>
              <p className="text-white/80 text-sm">Total de Associados</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">
                {associados.filter(a => a.status_assinatura === 'ativo').length}
              </p>
              <p className="text-white/80 text-sm">Assinaturas Ativas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#d4af37] to-[#c4a030]">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-[#1e3a5f] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#1e3a5f]">{estados.length}</p>
              <p className="text-[#1e3a5f]/80 text-sm">Estados com Associados</p>
            </CardContent>
          </Card>
        </div>

        {/* Busca de Cidade */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-white text-2xl font-bold">Encontre associados em sua região</h2>
            <p className="text-white/80 mt-2">Selecione o estado e a cidade para filtrar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={estadoFiltro} onValueChange={handleEstadoChange}>
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-[99999]" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <SelectItem value="todos" className="text-gray-900 hover:bg-gray-100 cursor-pointer">Todos os estados</SelectItem>
                {estados.map(estado => (
                  <SelectItem key={estado} value={estado} className="text-gray-900 hover:bg-gray-100 cursor-pointer">{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={cidadeFiltro} 
              onValueChange={setCidadeFiltro}
              disabled={estadoFiltro === 'todos'}
            >
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-[99999]" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <SelectItem value="todos" className="text-gray-900 hover:bg-gray-100 cursor-pointer">Todas as cidades</SelectItem>
                {cidades.map(cidade => (
                  <SelectItem key={cidade} value={cidade} className="text-gray-900 hover:bg-gray-100 cursor-pointer">{cidade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                if (estadoFiltro !== 'todos' && cidadeFiltro !== 'todos') {
                  toast.success(`Mostrando associados de ${cidadeFiltro}, ${estadoFiltro}`);
                } else {
                  toast.error('Selecione um estado e uma cidade');
                }
              }}
              disabled={estadoFiltro === 'todos' || cidadeFiltro === 'todos'}
              className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-bold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Filtrar Associados
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold text-gray-700">Filtrar Associados</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca por nome ou registro */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Nome ou Nº de Registro</label>
              <Input
                placeholder="Buscar associado..."
                value={registroBusca}
                onChange={(e) => setRegistroBusca(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Estado</label>
              <Select value={estadoFiltro} onValueChange={handleEstadoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-60 overflow-y-auto z-[9999]">
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Cidade</label>
              <Select 
                value={cidadeFiltro} 
                onValueChange={setCidadeFiltro}
                disabled={estadoFiltro === 'todos'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-60 overflow-y-auto z-[9999]">
                  <SelectItem value="todos">Todas as cidades</SelectItem>
                  {cidades.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status da Assinatura */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-60 overflow-y-auto z-[9999]">
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="aguardando_pagamento">Aguardando Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Associados Filtrados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1e3a5f]" />
            Associados Encontrados ({associadosFiltrados.length})
          </h2>
          {associadosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum associado encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros para encontrar associados em sua região.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {associadosFiltrados.map(associado => (
                <Card key={associado.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                        {associado.foto_url ? (
                          <img 
                            src={associado.foto_url} 
                            alt={associado.nome_completo}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-[#1e3a5f]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {associado.nome_completo}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {associado.representantes?.cidade}, {associado.representantes?.estado}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge 
                            variant={associado.status_assinatura === 'ativo' ? 'default' : 'secondary'}
                            className={associado.status_assinatura === 'ativo' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {associado.status_assinatura === 'ativo' ? 'Ativo' : associado.status_assinatura}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Registro: {associado.id?.slice(0, 8)}...
                        </p>
                        {associado.data_adesao && (
                          <p className="text-xs text-gray-400">
                            Desde: {formatDate(associado.data_adesao)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* S.O.S VIDAS PREMIUM */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            S.O.S VIDAS PREMIUM
          </h2>
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#d4af37] mb-4 tracking-wide">
              CLUBE DE BENEFÍCIOS
            </h3>
            <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6">
              Agora como associado da COBRELIC você tem direito a um clube de benefícios, com telemedicina e descontos em mais de 30 mil estabelecimentos em todo Brasil.
            </p>
            <Link to={createPageUrl('ClubeBeneficios')}>
              <Button className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-bold text-lg px-8 py-3 h-auto">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>

        {/* Anúncios em Destaque - Nacional */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1e3a5f]" />
            Anúncios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnunciosCarousel posicao="topo" nacional={true} />
            <AnunciosCarousel posicao="lateral" nacional={true} />
            <AnunciosCarousel posicao="rodape" nacional={true} />
          </div>
        </div>

        {/* Notícias em Destaque - Nacional */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1e3a5f]" />
            Notícias e Comunicados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NoticiasSection nacional={true} />
            </div>
            <div className="space-y-4">
              <AnunciosCarousel posicao="lateral" nacional={true} />
              <AnunciosCarousel posicao="rodape" nacional={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1e3a5f] py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="https://media.base44.com/images/public/693099089062f3cc56b4fd72/9668af615_Designsemnome-2026-03-18T114619559.png" 
              alt="COBRELIC"
              className="h-14 w-auto object-contain"
            />
          </div>
          <p className="text-white/60 text-sm">
            Confederação Brasileira das Entidades e Lideranças Comunitárias
          </p>
        </div>
      </div>
    </div>
  );
}
