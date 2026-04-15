import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function NoticiasSection({ nacional = false }) {
  const { data: noticias, isLoading } = useQuery({
    queryKey: ['noticias-publicas', nacional],
    queryFn: async () => {
      const allNoticias = await base44.entities.Noticia.filter({ ativo: true }, '-created_date', 20);
      
      // Se nacional=true, retorna apenas notícias nacionais
      if (nacional) {
        return allNoticias.filter(n => !n.estado && !n.cidade).slice(0, 6);
      }
      
      return allNoticias.slice(0, 6);
    },
  });

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700',
    institucional: 'bg-[#1e3a5f] text-white',
    eventos: 'bg-[#d4af37] text-[#1e3a5f]',
    comunicados: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-lg font-bold text-gray-800">Notícias</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-lg font-bold text-gray-800">Notícias</h2>
        </div>
        <p className="text-gray-500 text-center py-8">Nenhuma notícia disponível no momento.</p>
      </div>
    );
  }

  // Separar destaque das demais
  const destaques = noticias.filter((n) => n.destaque);
  const outras = noticias.filter((n) => !n.destaque);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-lg font-bold text-gray-800">Notícias</h2>
        </div>
      </div>

      {/* Notícias em Destaque */}
      {destaques.length > 0 && (
        <div className="grid gap-4">
          {destaques.map((noticia) => (
            <Card key={noticia.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md">
              <a
                href={noticia.link_externo || '#'}
                target={noticia.link_externo ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block"
              >
                {noticia.imagem_url && (
                  <img
                    src={noticia.imagem_url}
                    alt={noticia.titulo}
                    className="w-full h-40 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
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
                  <h3 className="font-bold text-gray-800 mb-1">{noticia.titulo}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{noticia.resumo}</p>
                  {noticia.link_externo && (
                    <div className="flex items-center gap-1 text-[#1e3a5f] text-sm mt-2 font-medium">
                      Ler mais <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      )}

      {/* Outras Notícias */}
      <div className="space-y-3">
        {outras.map((noticia) => (
          <a
            key={noticia.id}
            href={noticia.link_externo || '#'}
            target={noticia.link_externo ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
          >
            {noticia.imagem_url && (
              <img
                src={noticia.imagem_url}
                alt={noticia.titulo}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs ${categoriaColors[noticia.categoria] || categoriaColors.geral}`}>
                  {noticia.categoria}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{noticia.titulo}</h3>
              <p className="text-gray-500 text-xs line-clamp-1 mt-1">{noticia.resumo}</p>
            </div>
            {noticia.link_externo && (
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}