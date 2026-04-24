import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Newspaper, 
  Calendar, 
  ArrowLeft,
  Eye,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Clock
} from 'lucide-react';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Marca a página como pública
NoticiaDetalhes.public = true;

export default function NoticiaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: noticia, isLoading, error } = useQuery({
    queryKey: ['noticia', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select(`
          *,
          autor:autor_id(nome)
        `)
        .eq('id', id)
        .eq('ativo', true)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Buscar notícias relacionadas (mesma categoria ou mais recentes)
  const { data: noticiasRelacionadas } = useQuery({
    queryKey: ['noticias-relacionadas', id, noticia?.categoria],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('ativo', true)
        .neq('id', id)
        .order('publicado_em', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!noticia,
  });

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700 border-gray-200',
    institucional: 'bg-[#1e3a5f] text-white border-[#1e3a5f]',
    eventos: 'bg-[#d4af37] text-[#1e3a5f] border-[#d4af37]',
    comunicados: 'bg-red-100 text-red-700 border-red-200',
  };

  const categoriaLabels = {
    geral: 'Geral',
    institucional: 'Institucional',
    eventos: 'Eventos',
    comunicados: 'Comunicados',
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = noticia?.titulo || 'Confira esta notícia!';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <PublicHeader />

        {/* Content Skeleton */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 md:h-96 w-full rounded-xl mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <PublicHeader />

        {/* Error Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Notícia não encontrada</h1>
          <p className="text-gray-600 mb-6">A notícia que você está procurando não existe ou foi removida.</p>
          <Button
            onClick={() => navigate('/NoticiasPublico')}
            className="bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Notícias
          </Button>
        </main>

        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <PublicHeader />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#1e3a5f]">Home</Link>
          <span>/</span>
          <Link to="/NoticiasPublico" className="hover:text-[#1e3a5f]">Notícias</Link>
          <span>/</span>
          <span className="text-gray-700 truncate">{noticia.titulo}</span>
        </div>

        {/* Botão Voltar */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/NoticiasPublico')}
          className="mb-6 -ml-2 text-gray-600 hover:text-[#1e3a5f]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Notícias
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Notícia */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Imagem Principal */}
              {noticia.imagem_url ? (
                <div className="relative">
                  <img
                    src={noticia.imagem_url}
                    alt={noticia.titulo}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${categoriaColors[noticia.categoria]} text-sm font-medium border`}>
                      {categoriaLabels[noticia.categoria] || noticia.categoria}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center">
                  <Newspaper className="w-24 h-24 text-white/30" />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {noticia.publicado_em ? 
                      format(new Date(noticia.publicado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 
                      'Data não disponível'
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {noticia.publicado_em && 
                      format(new Date(noticia.publicado_em), "HH:mm")
                    }
                  </div>
                  {noticia.autor && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Por</span>
                      <span className="font-medium text-gray-700">{noticia.autor.nome}</span>
                    </div>
                  )}
                  {noticia.visualizacoes > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {noticia.visualizacoes} visualizações
                    </div>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                  {noticia.titulo}
                </h1>

                {/* Resumo */}
                {noticia.resumo && (
                  <div className="bg-[#1e3a5f]/5 border-l-4 border-[#1e3a5f] p-4 mb-6 rounded-r-lg">
                    <p className="text-lg text-gray-700 italic">{noticia.resumo}</p>
                  </div>
                )}

                {/* Conteúdo */}
                <div 
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                />

                {/* Compartilhamento */}
                <div className="border-t border-gray-200 mt-8 pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Compartilhar:
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-9 h-9 rounded-full text-blue-600 hover:bg-blue-50"
                          onClick={() => handleShare('facebook')}
                        >
                          <Facebook className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-9 h-9 rounded-full text-sky-500 hover:bg-sky-50"
                          onClick={() => handleShare('twitter')}
                        >
                          <Twitter className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-9 h-9 rounded-full text-blue-700 hover:bg-blue-50"
                          onClick={() => handleShare('linkedin')}
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {noticia.link_externo && (
                      <a
                        href={noticia.link_externo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e3a5f] hover:text-[#152a45] font-medium flex items-center gap-1"
                      >
                        Ler notícia completa na fonte
                        <ArrowLeft className="w-4 h-4 rotate-45" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Notícias Relacionadas */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-[#1e3a5f]" />
                    Mais Notícias
                  </h3>
                  
                  {noticiasRelacionadas?.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma outra notícia disponível.</p>
                  ) : (
                    <div className="space-y-4">
                      {noticiasRelacionadas?.map((n) => (
                        <Link
                          key={n.id}
                          to={`/NoticiaDetalhes/${n.id}`}
                          className="group block"
                        >
                          <div className="flex gap-3">
                            {n.imagem_url ? (
                              <img
                                src={n.imagem_url}
                                alt={n.titulo}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Newspaper className="w-6 h-6 text-white/50" />
                              </div>
                            )}
                            <div>
                              <Badge className={`${categoriaColors[n.categoria]} text-xs mb-1`}>
                                {categoriaLabels[n.categoria] || n.categoria}
                              </Badge>
                              <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#1e3a5f] line-clamp-2 transition-colors">
                                {n.titulo}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {n.publicado_em && 
                                  format(new Date(n.publicado_em), "dd/MM/yyyy")
                                }
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link 
                    to="/NoticiasPublico"
                    className="block text-center text-[#1e3a5f] font-medium text-sm mt-4 hover:underline"
                  >
                    Ver todas as notícias
                  </Link>
                </CardContent>
              </Card>

              {/* Banner CTA */}
              <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white">
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2">Faça Parte da COBRELIC</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Associe-se e tenha acesso a benefícios exclusivos, notícias e muito mais.
                  </p>
                  <Link 
                    to="/Login?tab=cadastro"
                    className="block w-full text-center bg-[#d4af37] hover:bg-[#b8962e] text-[#1e3a5f] font-bold py-2 rounded-lg transition-colors"
                  >
                    Associe-se Agora
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
