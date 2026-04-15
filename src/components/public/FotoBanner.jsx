import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fotos = [
  {
    src: "https://media.base44.com/images/public/693099089062f3cc56b4fd72/4886a0903_WhatsAppImage2026-03-18at122624.jpg",
    alt: "COBRELIC - Lideranças Comunitárias"
  },
  {
    src: "https://media.base44.com/images/public/693099089062f3cc56b4fd72/aad3d5da9_WhatsAppImage2026-02-19at1728471.jpg",
    alt: "COBRELIC - Evento"
  },
];

export default function FotoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (fotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % fotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent(prev => (prev - 1 + fotos.length) % fotos.length);
  const next = () => setCurrent(prev => (prev + 1) % fotos.length);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg mb-6 group">
      <img
        src={fotos[current].src}
        alt={fotos[current].alt}
        className="w-full object-cover max-h-80 transition-opacity duration-500"
      />
      {fotos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {fotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}