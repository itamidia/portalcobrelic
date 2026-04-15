import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnunciosCarousel({ posicao = 'topo', estado, cidade, nacional = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios', posicao, estado, cidade, nacional],
    queryFn: async () => {
      const allAnuncios = await base44.entities.Anuncio.filter({ ativo: true, posicao });
      
      // Se nacional=true, retorna apenas anúncios nacionais
      if (nacional) {
        return allAnuncios.filter(a => !a.estado && !a.cidade);
      }
      
      // Se estado e cidade forem fornecidos, filtra por eles
      if (estado && cidade) {
        const anunciosCidade = allAnuncios.filter(
          a => a.estado === estado && a.cidade === cidade
        );
        
        // Se houver anúncios da cidade, retorna eles
        if (anunciosCidade.length > 0) {
          return anunciosCidade;
        }
        
        // Senão, retorna os nacionais (sem estado e cidade)
        return allAnuncios.filter(a => !a.estado && !a.cidade);
      }
      
      return allAnuncios;
    },
  });

  const sortedAnuncios = anuncios?.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)) || [];

  // Auto-rotate
  useEffect(() => {
    if (sortedAnuncios.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedAnuncios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sortedAnuncios.length]);

  if (isLoading || sortedAnuncios.length === 0) {
    return null;
  }

  const currentAnuncio = sortedAnuncios[currentIndex];

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedAnuncios.length) % sortedAnuncios.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedAnuncios.length);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100">
      <a
        href={currentAnuncio.link_destino || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative group"
      >
        <img
          src={currentAnuncio.imagem_url}
          alt={currentAnuncio.titulo}
          className="w-full h-32 md:h-40 object-cover transition-transform group-hover:scale-105"
        />
        {currentAnuncio.link_destino && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </a>

      {sortedAnuncios.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {sortedAnuncios.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}