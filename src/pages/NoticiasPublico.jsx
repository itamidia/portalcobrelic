import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Newspaper,
  Calendar,
  ChevronRight,
  TrendingUp,
  Tag,
  Video
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import AnunciosCarousel from '@/components/public/AnunciosCarousel';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

// Componente de Banner de Anúncio Full-width (Topo)
function BannerAnuncio() {
  const { data: banner, isLoading } = useQuery({
    queryKey: ['anuncio-banner-topo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .eq('posicao', 'topo')
        .order('ordem', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-40 md:h-56" />;
  }

  if (!banner) {
    return (
      <div className="w-full h-40 md:h-56 bg-gradient-to-r from-[#1e3a5f]/10 to-[#2d5a8f]/10 flex items-center justify-center border-y-2 border-dashed border-[#1e3a5f]/20">
        <span className="text-[#1e3a5f]/40 font-medium">Espaço para banner</span>
      </div>
    );
  }

  return (
    <a 
      href={banner.link || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-40 md:h-56 bg-gray-100"
    >
      <img 
        src={banner.imagem_url} 
        alt={banner.titulo}
        className="w-full h-full object-contain"
      />
    </a>
  );
}

// Componente de Banner de Rodapé Full-width
function BannerRodape() {
  const { data: banner, isLoading } = useQuery({
    queryKey: ['anuncio-banner-rodape'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .eq('posicao', 'rodape')
        .order('ordem', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-40 md:h-56" />;
  }

  if (!banner) {
    return (
      <div className="w-full h-40 md:h-56 bg-gradient-to-r from-[#1e3a5f]/10 to-[#2d5a8f]/10 flex items-center justify-center border-y-2 border-dashed border-[#1e3a5f]/20">
        <span className="text-[#1e3a5f]/40 font-medium">Espaço para banner de rodapé</span>
      </div>
    );
  }

  return (
    <a 
      href={banner.link || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-40 md:h-56 bg-gray-100"
    >
      <img 
        src={banner.imagem_url} 
        alt={banner.titulo}
        className="w-full h-full object-contain"
      />
    </a>
  );
}

// Componente de Notícia Principal (Destaque)
function NoticiaDestaque({ noticia }) {
  if (!noticia) return null;

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700',
    institucional: 'bg-[#1e3a5f] text-white',
    eventos: 'bg-[#d4af37] text-[#1e3a5f]',
    comunicados: 'bg-red-100 text-red-700',
  };

  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-lg cursor-pointer"
      onClick={() => navigate(`/NoticiaDetalhes/${noticia.id}`)}
    >
        {noticia.imagem_url ? (
          <img
            src={noticia.imagem_url}
            alt={noticia.titulo}
            className="w-full h-48 md:h-64 object-cover"
          />
        ) : (
          <div className="w-full h-48 md:h-64 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-white/50" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={categoriaColors[noticia.categoria] || categoriaColors.geral}>
              {noticia.categoria}
            </Badge>
            {noticia.data_publicacao && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(noticia.data_publicacao), "dd/MM/yyyy")}
              </span>
            )}
          </div>
          <h2 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">{noticia.titulo}</h2>
          <p className="text-gray-600 text-sm line-clamp-3">{noticia.resumo}</p>
          <div className="flex items-center gap-1 text-[#1e3a5f] text-sm mt-3 font-medium">
            Ler mais <ChevronRight className="w-4 h-4" />
          </div>
        </CardContent>
    </Card>
  );
}

// Componente de Lista de Notícias por Categoria
function NoticiasPorCategoria({ categoria, titulo, icone: Icon }) {
  const { data: noticias, isLoading } = useQuery({
    queryKey: ['noticias-categoria', categoria],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('ativo', true)
        .eq('categoria', categoria)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700 border-gray-200',
    institucional: 'bg-[#1e3a5f] text-white border-[#1e3a5f]',
    eventos: 'bg-[#d4af37] text-[#1e3a5f] border-[#d4af37]',
    comunicados: 'bg-red-100 text-red-700 border-red-200',
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${categoriaColors[categoria]?.split(' ')[2] || 'border-gray-200'}`}>
        {Icon && <Icon className="w-5 h-5 text-[#1e3a5f]" />}
        <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
        <Badge className={`ml-auto ${categoriaColors[categoria] || categoriaColors.geral}`}>
          {noticias.length} notícias
        </Badge>
      </div>
      <div className="grid gap-4">
        {noticias.map((noticia) => (
          <Link
            key={noticia.id}
            to={`/NoticiaDetalhes/${noticia.id}`}
            className="flex gap-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
          >
            {noticia.imagem_url ? (
              <img
                src={noticia.imagem_url}
                alt={noticia.titulo}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {noticia.data_publicacao ? format(new Date(noticia.data_publicacao), "dd/MM/yyyy") : ''}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{noticia.titulo}</h4>
              <p className="text-gray-500 text-xs line-clamp-2">{noticia.resumo}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Componente de Anúncios Laterais (Sidebar)
function AnunciosSidebar() {
  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .eq('posicao', 'lateral')
        .order('ordem', { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!anuncios || anuncios.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
            <span className="text-gray-400 text-sm">Espaço para anúncio</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {anuncios.map((anuncio) => (
        <a
          key={anuncio.id}
          href={anuncio.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-100"
        >
          <img
            src={anuncio.imagem_url}
            alt={anuncio.titulo}
            className="w-full h-40 object-contain"
          />
        </a>
      ))}
    </div>
  );
}

// Componente de Vídeo em Destaque
function VideoDestaque() {
  const { data: video, isLoading } = useQuery({
    queryKey: ['video-destaque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_clube')
        .select('*')
        .eq('ativo', true)
        .eq('destaque', true)
        .order('ordem', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Função para converter URL do YouTube para embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`;
    }
    return url;
  };

  if (isLoading) {
    return <Skeleton className="h-48 md:h-64 rounded-lg" />;
  }

  if (!video) {
    return (
      <div className="bg-gray-100 rounded-lg h-48 md:h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-400">
          <Video className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Nenhum vídeo em destaque</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={getEmbedUrl(video.url_video)}
          title={video.titulo}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <p className="text-sm text-gray-600 mt-3">{video.titulo}</p>
    </div>
  );
}

// Componente de Parceiros Carousel (todos visíveis)
function ParceirosCarousel() {
  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios-parceiros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .eq('posicao', 'parceiros')
        .order('ordem', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <Skeleton className="h-24 rounded-lg" />;
  }

  if (!anuncios || anuncios.length === 0) {
    return (
      <div className="h-24 rounded-lg bg-gradient-to-r from-[#1e3a5f]/5 to-[#2d5a8f]/5 flex items-center justify-center border-2 border-dashed border-[#1e3a5f]/20">
        <span className="text-[#1e3a5f]/40 font-medium text-sm">Espaço para parceiros</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">Nossos Parceiros</h4>
      <div className="flex flex-wrap justify-center gap-4">
        {anuncios.map((anuncio) => (
          <a
            key={anuncio.id}
            href={anuncio.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block grayscale hover:grayscale-0 transition-all"
          >
            <img
              src={anuncio.imagem_url}
              alt={anuncio.titulo}
              className="h-12 w-auto object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

// Componente principal da página
export default function NoticiasPublico() {
  // Buscar notícia em destaque
  const { data: noticiaDestaque, isLoading: loadingDestaque } = useQuery({
    queryKey: ['noticia-destaque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('ativo', true)
        .eq('destaque', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Buscar notícias recentes (se não houver destaque)
  const { data: noticiasRecentes } = useQuery({
    queryKey: ['noticias-recentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    },
    enabled: !loadingDestaque && !noticiaDestaque,
  });

  const noticiaPrincipal = noticiaDestaque || noticiasRecentes;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Banner Full-width abaixo do Header */}
      <BannerAnuncio />

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção de Destaque: Notícia + Vídeo */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Notícia Principal */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">Destaque</h2>
            </div>
            {loadingDestaque ? (
              <Skeleton className="h-80 rounded-lg" />
            ) : (
              <NoticiaDestaque noticia={noticiaPrincipal} />
            )}
          </div>

          {/* Vídeo em Destaque */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-[#1e3a5f]" />
              <h2 className="text-xl font-bold text-gray-800">Vídeo em Destaque</h2>
            </div>
            <VideoDestaque />
          </div>
        </div>

        {/* Carousel de Parceiros */}
        <div className="mb-8">
          <ParceirosCarousel />
        </div>

        {/* Layout de Notícias por Categoria + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Notícias por Categoria */}
          <div className="lg:col-span-2">
            <NoticiasPorCategoria 
              categoria="institucional" 
              titulo="Notícias Institucionais" 
              icone={Newspaper}
            />
            <NoticiasPorCategoria 
              categoria="eventos" 
              titulo="Eventos" 
              icone={Calendar}
            />
            <NoticiasPorCategoria 
              categoria="comunicados" 
              titulo="Comunicados Oficiais" 
              icone={Tag}
            />
            <NoticiasPorCategoria 
              categoria="geral" 
              titulo="Geral" 
              icone={Newspaper}
            />
          </div>

          {/* Sidebar - Anúncios */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-[#1e3a5f]" />
                <h3 className="text-lg font-bold text-gray-800">Anúncios</h3>
              </div>
              <AnunciosSidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Banner de Rodapé Full-width */}
      <BannerRodape />

      <PublicFooter />
    </div>
  );
}
