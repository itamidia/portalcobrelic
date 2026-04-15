import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Shield, MapPin, Users, Heart, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import RepresentanteCard from '../components/representantes/RepresentanteCard';
import QuemSomosModal from '../components/public/QuemSomosModal';
import AnunciosCarousel from '../components/public/AnunciosCarousel';

CidadeDetalhes.public = true;

export default function CidadeDetalhes() {
  const [showQuemSomos, setShowQuemSomos] = useState(false);
  const [buscaNome, setBuscaNome] = useState('');
  
  // Pega estado e cidade da URL
  const urlParams = new URLSearchParams(window.location.search);
  const estado = urlParams.get('estado') || '';
  const cidade = urlParams.get('cidade') || '';

  // Busca notícias da cidade ou nacionais
  const { data: noticias = [], isLoading: loadingNoticias } = useQuery({
    queryKey: ['noticias-cidade', estado, cidade],
    queryFn: async () => {
      const { data: allNoticias, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      
      // Filtra notícias da cidade específica
      const noticiasCidade = (allNoticias || []).filter(
        n => n.estado === estado && n.cidade === cidade
      );
      
      // Se não houver notícias da cidade, pega as nacionais
      if (noticiasCidade.length === 0) {
        return (allNoticias || []).filter(n => !n.estado && !n.cidade);
      }
      
      return noticiasCidade;
    },
    enabled: !!estado && !!cidade,
  });

  // Busca anúncios da cidade ou nacionais
  const { data: anuncios = [], isLoading: loadingAnuncios } = useQuery({
    queryKey: ['anuncios-cidade', estado, cidade],
    queryFn: async () => {
      const { data: allAnuncios, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      
      // Filtra anúncios da cidade específica
      const anunciosCidade = (allAnuncios || []).filter(
        a => a.estado === estado && a.cidade === cidade
      );
      
      // Para cada posição, se não houver anúncio da cidade, usa o nacional
      const anunciosPorPosicao = {};
      const posicoes = ['topo', 'lateral', 'rodape'];
      
      posicoes.forEach(pos => {
        const anuncioCidade = anunciosCidade.find(a => a.posicao === pos);
        if (anuncioCidade) {
          anunciosPorPosicao[pos] = anuncioCidade;
        } else {
          // Busca nacional para essa posição
          const anuncioNacional = (allAnuncios || []).find(
            a => a.posicao === pos && !a.estado && !a.cidade
          );
          if (anuncioNacional) {
            anunciosPorPosicao[pos] = anuncioNacional;
          }
        }
      });
      
      return Object.values(anunciosPorPosicao);
    },
    enabled: !!estado && !!cidade,
  });

  // Busca representantes da cidade
  const { data: representantes = [], isLoading: loadingReps } = useQuery({
    queryKey: ['representantes-cidade', estado, cidade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('ativo', true)
        .eq('estado', estado)
        .eq('cidade', cidade);
      if (error) throw error;
      return data || [];
    },
    enabled: !!estado && !!cidade,
  });

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700',
    institucional: 'bg-[#1e3a5f] text-white',
    eventos: 'bg-[#d4af37] text-[#1e3a5f]',
    comunicados: 'bg-red-100 text-red-700',
  };

  const anuncioLateral = anuncios.find(a => a.posicao === 'lateral');
  const anuncioRodape = anuncios.find(a => a.posicao === 'rodape');

  // Filtra presidente municipal e líderes comunitários
  const presidenteMunicipal = representantes.find(r => r.cargo === 'Presidente Municipal');
  const lideresComunitarios = representantes.filter(r => r.cargo === 'Líder Comunitário');
  
  // Filtra diretoria
  const diretoria = representantes.filter(r => 
    ['Vice Presidente', 'Secretário', 'Diretor Financeiro', 'Diretor de Articulação', 'Diretor Social'].includes(r.cargo)
  );
  
  // Filtra líderes por nome
  const lideresFiltrados = lideresComunitarios.filter(lider => 
    !buscaNome || lider.nome.toLowerCase().includes(buscaNome.toLowerCase())
  );

  if (!estado || !cidade) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Localização não especificada
            </h2>
            <p className="text-gray-600 mb-4">
              Esta página precisa dos parâmetros de estado e cidade na URL.
            </p>
            <Link to={createPageUrl('Representantes')}>
              <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                Voltar para Representantes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingNoticias || loadingAnuncios || loadingReps) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-10 w-64 bg-white/20 mb-2" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <Skeleton className="h-64 w-full mb-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuemSomosModal open={showQuemSomos} onOpenChange={setShowQuemSomos} />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://media.base44.com/images/public/693099089062f3cc56b4fd72/9668af615_Designsemnome-2026-03-18T114619559.png" 
                alt="COBRELIC"
                className="w-12 h-12 rounded-xl object-contain bg-white"
              />
              <span className="text-white/80 font-medium text-lg">COBRELIC</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowQuemSomos(true)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Info className="w-4 h-4 mr-2" />
                Quem Somos
              </Button>
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
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
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-6 h-6 text-[#d4af37]" />
            <h1 className="text-white text-3xl md:text-4xl font-bold">
              {cidade} - {estado}
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Notícias, patrocinadores e representantes locais
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Presidente Municipal */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2 text-center">
            Presidente Municipal de {cidade}
          </h2>
          {presidenteMunicipal && (
            <h3 className="text-xl font-semibold text-[#d4af37] mb-6 text-center">
              {presidenteMunicipal.nome}
            </h3>
          )}
          {presidenteMunicipal ? (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img 
                  src={presidenteMunicipal.foto_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/5c2541974_AssociaoNacionaldosLder4esComunitrios7.png"}
                  alt={presidenteMunicipal.nome}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#d4af37]"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">{presidenteMunicipal.nome}</h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {presidenteMunicipal.descricao || "Presidente Municipal comprometido com o desenvolvimento e valorização dos líderes comunitários de nossa cidade. Trabalho em prol da comunidade, buscando sempre defender os interesses e necessidades de nossa população local."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/5c2541974_AssociaoNacionaldosLder4esComunitrios7.png"
                  alt="Presidente Municipal"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#d4af37]"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Presidente Municipal</h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  Presidente Municipal comprometido com o desenvolvimento e valorização dos líderes comunitários de nossa cidade. Trabalho em prol da comunidade, buscando sempre defender os interesses e necessidades de nossa população local.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Diretoria Municipal */}
        {diretoria.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 text-center">
              Diretoria Municipal de {cidade}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {diretoria.map(membro => (
                <div key={membro.id} className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-[#d4af37]">
                    {membro.foto_url ? (
                      <img 
                        src={membro.foto_url} 
                        alt={membro.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{membro.nome}</h3>
                  <p className="text-xs text-[#1e3a5f] font-medium">{membro.cargo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anúncio Topo - Carrossel */}
        <div className="mb-6">
          <AnunciosCarousel posicao="topo" estado={estado} cidade={cidade} />
        </div>

        {/* S.O.S VIDAS PREMIUM */}
        <div className="mb-8">
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

        {/* Notícias e Anúncios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Notícias */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1e3a5f]" />
              Notícias e Comunicados
            </h2>
            {noticias.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Nenhuma notícia disponível no momento</p>
              </Card>
            ) : (
              noticias.slice(0, 6).map((noticia) => (
                <Card key={noticia.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {noticia.imagem_url && (
                        <div className="w-32 h-24 flex-shrink-0 bg-gray-100">
                          <img
                            src={noticia.imagem_url}
                            alt={noticia.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 py-3 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 line-clamp-2">
                            {noticia.titulo}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {noticia.resumo}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={categoriaColors[noticia.categoria]}>
                            {noticia.categoria}
                          </Badge>
                          {noticia.data_publicacao && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(noticia.data_publicacao), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Anúncios Lateral */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1e3a5f]" />
              Patrocinadores
            </h2>
            {anuncioLateral && (
              <a
                href={anuncioLateral.link_destino || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={anuncioLateral.imagem_url}
                  alt={anuncioLateral.titulo}
                  className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </a>
            )}
            {anuncioRodape && (
              <a
                href={anuncioRodape.link_destino || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={anuncioRodape.imagem_url}
                  alt={anuncioRodape.titulo}
                  className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </a>
            )}
          </div>
        </div>



        {/* Líderes Comunitários */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1e3a5f]" />
            Líderes Comunitários de {cidade}
          </h2>
          
          {/* Busca por nome */}
          <div className="mb-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar líder comunitário por nome..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {lideresComunitarios.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum líder comunitário cadastrado para esta cidade</p>
            </Card>
          ) : lideresFiltrados.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum líder comunitário encontrado com esse nome</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lideresFiltrados.map(lider => (
                <RepresentanteCard key={lider.id} representante={lider} />
              ))}
            </div>
          )}
        </div>

        {/* Todos os Representantes */}
        {representantes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1e3a5f]" />
              Todos os Representantes em {cidade}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...representantes]
                .sort((a, b) => {
                  const ordem = { 'Presidente Estadual': 1, 'Presidente Municipal': 2, 'Líder Comunitário': 3 };
                  return (ordem[a.cargo] || 99) - (ordem[b.cargo] || 99);
                })
                .map(rep => (
                  <RepresentanteCard key={rep.id} representante={rep} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#1e3a5f] py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-[#d4af37]" />
            <span className="text-white font-bold">COBRELIC</span>
          </div>
          <p className="text-white/60 text-sm">
            Associação Nacional de Apoio Legal e Comunitário
          </p>
        </div>
      </div>
    </div>
  );
}