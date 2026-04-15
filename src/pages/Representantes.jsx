import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search, Users, MapPin, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import QuemSomosModal from '../components/public/QuemSomosModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import RepresentanteCard from '../components/representantes/RepresentanteCard';
import RepresentanteMiniCard from '../components/representantes/RepresentanteMiniCard';
import RadioPlayer from '../components/public/RadioPlayer';
import AnunciosCarousel from '../components/public/AnunciosCarousel';
import FotoBanner from '../components/public/FotoBanner';
import NoticiasSection from '../components/public/NoticiasSection';

const CARGOS = [
  'Presidente Estadual',
  'Presidente Municipal',
  'Líder Comunitário',
];

// Marca a página como pública
Representantes.public = true;

export default function Representantes() {
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [cidadeFiltro, setCidadeFiltro] = useState('todos');
  const [cargoFiltro, setCargoFiltro] = useState('todos');
  const [showQuemSomos, setShowQuemSomos] = useState(false);
  const [registroBusca, setRegistroBusca] = useState('');

  const { data: representantes = [], isLoading } = useQuery({
    queryKey: ['representantes-publico'],
    queryFn: async () => {
      const result = await base44.entities.Representante.filter({ ativo: true });
      return result || [];
    },
  });

  // Extrair estados únicos
  const estados = useMemo(() => {
    if (!representantes || !Array.isArray(representantes)) return [];
    const uniqueEstados = [...new Set(representantes.map(r => r.estado))].filter(Boolean);
    return uniqueEstados.sort();
  }, [representantes]);

  // Extrair cidades do estado selecionado
  const cidades = useMemo(() => {
    if (!representantes || !Array.isArray(representantes) || estadoFiltro === 'todos') return [];
    const cidadesDoEstado = representantes
      .filter(r => r.estado === estadoFiltro)
      .map(r => r.cidade);
    return [...new Set(cidadesDoEstado)].filter(Boolean).sort();
  }, [representantes, estadoFiltro]);

  // Filtrar representantes
  const representantesFiltrados = useMemo(() => {
    if (!representantes || !Array.isArray(representantes)) return [];
    const filtered = representantes.filter(r => {
      const matchEstado = estadoFiltro === 'todos' || r.estado === estadoFiltro;
      const matchCidade = cidadeFiltro === 'todos' || r.cidade === cidadeFiltro;
      const matchCargo = cargoFiltro === 'todos' || r.cargo === cargoFiltro;
      const matchRegistro = !registroBusca || r.id?.toLowerCase().includes(registroBusca.toLowerCase());
      return matchEstado && matchCidade && matchCargo && matchRegistro;
    });
    
    return filtered;
  }, [representantes, estadoFiltro, cidadeFiltro, cargoFiltro, registroBusca]);

  // Reset cidade quando muda o estado
  const handleEstadoChange = (value) => {
    setEstadoFiltro(value);
    setCidadeFiltro('todos');
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
        {/* Presidente Nacional */}
        <div className="bg-[#1e3a5f] rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Presidente Nacional da COBRELIC
          </h2>
          <h3 className="text-xl font-semibold text-[#d4af37] mb-6 text-center">
            Wellington Andrade
          </h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/94796e554_Designsemnome81.png"
                alt="Presidente Nacional"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#d4af37]"
              />
            </div>
            <div className="flex-1">
              <p className="text-white leading-relaxed text-justify">
                "Tenho 48 anos e me orgulho de ter nascido no Distrito Federal. Sou entusiasta das políticas públicas do terceiro setor, defensor popular e jornalista. Fui autor da primeira frente parlamentar em defesa, valorização e desenvolvimento dos líderes comunitários do Distrito Federal e cidades metropolitanas, no período de 2019 a 2022, na CLDF. Atualmente, estou presidente nacional da COBRELIC - Confederação Brasileira das Entidades e Lideranças Comunitárias. Tenho uma premissa especial: juntos e com Jesus somos mais fortes."
              </p>
            </div>
          </div>
        </div>

        {/* Banner rotativo de fotos */}
        <FotoBanner />

        {/* Busca de Cidade */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-white text-2xl font-bold">Selecione o estado e a cidade para ver conteúdo exclusivo da sua região</h2>
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
                  window.location.href = createPageUrl('CidadeDetalhes') + `?estado=${estadoFiltro}&cidade=${cidadeFiltro}`;
                } else {
                  toast.error('Selecione um estado e uma cidade');
                }
              }}
              disabled={estadoFiltro === 'todos' || cidadeFiltro === 'todos'}
              className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-bold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Acessar Portal
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold text-gray-700">Filtrar Representantes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Número de Registro */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Nº de Registro</label>
              <Input
                placeholder="Buscar por registro..."
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

            {/* Cargo */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Cargo</label>
              <Select value={cargoFiltro} onValueChange={setCargoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cargos" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-60 overflow-y-auto z-[9999]">
                  <SelectItem value="todos">Todos os cargos</SelectItem>
                  {CARGOS.map(cargo => (
                    <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Representantes Filtrados */}
        {(estadoFiltro !== 'todos' || cidadeFiltro !== 'todos' || cargoFiltro !== 'todos' || registroBusca) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1e3a5f]" />
              Representantes Encontrados ({representantesFiltrados.length})
            </h2>
            {representantesFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum representante encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros para encontrar representantes em sua região.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {representantesFiltrados.map(representante => (
                  <RepresentanteCard 
                    key={representante.id} 
                    representante={representante} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout com Anúncios e Notícias */}
        <div className="space-y-8">
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
                Agora como líder comunitário da COBRELIC você tem direito a um clube de benefícios, com telemedicina e descontos em mais de 30 mil estabelecimentos em todo Brasil.
              </p>
              <Link to={createPageUrl('ClubeBeneficios')}>
                <Button className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-bold text-lg px-8 py-3 h-auto">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>

          {/* Anúncios em Destaque - Nacional */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1e3a5f]" />
              Parceiros e Patrocinadores Nacionais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnunciosCarousel posicao="topo" nacional={true} />
              <AnunciosCarousel posicao="lateral" nacional={true} />
              <AnunciosCarousel posicao="rodape" nacional={true} />
            </div>
          </div>

          {/* Notícias em Destaque - Nacional */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1e3a5f]" />
              Notícias e Comunicados Nacionais
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

          {/* Alguns Representantes em Destaque */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1e3a5f]" />
              Nossos Representantes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {representantes.slice(0, 5).map(representante => (
                <RepresentanteMiniCard 
                  key={representante.id} 
                  representante={representante} 
                />
              ))}
            </div>
            
            {/* Link para buscar mais representantes */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  document.querySelector('.bg-white.rounded-xl.shadow-lg')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-[#1e3a5f] hover:text-[#d4af37] font-semibold transition-colors"
              >
                <Search className="w-5 h-5" />
                Pesquisar por mais representantes
              </button>
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