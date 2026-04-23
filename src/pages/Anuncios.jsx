import { useState } from 'react';
import { supabase } from '@/api/supabaseApi';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Megaphone, MapPin, Filter } from 'lucide-react';

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Anuncios() {
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios-publicos', filtroEstado],
    queryFn: async () => {
      let query = supabase
        .from('anuncios')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (filtroEstado !== 'todos') {
        query = query.or(`estado.eq.${filtroEstado},and(estado.is.null,cidade.is.null)`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const anunciosNacionais = anuncios?.filter(a => !a.estado && !a.cidade) || [];
  const anunciosLocais = anuncios?.filter(a => a.estado || a.cidade) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[#d4af37]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Anúncios</h1>
          </div>
          <p className="text-white/80 text-sm">
            Confira as ofertas e oportunidades disponíveis
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por estado</span>
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos os anúncios</option>
              <option value="nacional">Apenas nacionais</option>
              {ESTADOS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : anuncios?.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum anúncio disponível
            </h3>
            <p className="text-gray-500 text-sm">
              Não há anúncios ativos no momento para este filtro.
            </p>
          </div>
        ) : (
          <>
            {/* Anúncios Nacionais */}
            {anunciosNacionais.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#1e3a5f] text-white">Nacional</Badge>
                  <span className="text-sm text-gray-500">
                    {anunciosNacionais.length} anúncio{anunciosNacionais.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {anunciosNacionais.map(anuncio => (
                    <AnuncioCard key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>
              </div>
            )}

            {/* Anúncios Locais */}
            {anunciosLocais.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="border-[#d4af37] text-[#d4af37]">
                    <MapPin className="w-3 h-3 mr-1" />
                    Local
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {anunciosLocais.length} anúncio{anunciosLocais.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {anunciosLocais.map(anuncio => (
                    <AnuncioCard key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AnuncioCard({ anuncio }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <a
        href={anuncio.link_destino || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative">
          <img
            src={anuncio.imagem_url}
            alt={anuncio.titulo}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {anuncio.link_destino && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{anuncio.titulo}</h3>
          {(anuncio.estado || anuncio.cidade) && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>
                {anuncio.cidade && anuncio.estado 
                  ? `${anuncio.cidade} - ${anuncio.estado}` 
                  : anuncio.estado || anuncio.cidade}
              </span>
            </div>
          )}
        </CardContent>
      </a>
    </Card>
  );
}
