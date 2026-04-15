import React from 'react';
import { User, MapPin } from 'lucide-react';

export default function RepresentanteMiniCard({ representante }) {
  const cargoColors = {
    'Presidente Estadual': 'bg-[#d4af37] text-[#1e3a5f]',
    'Presidente Municipal': 'bg-[#1e3a5f] text-white',
    'Diretor': 'bg-blue-600 text-white',
    'Líder Comunitário': 'bg-emerald-600 text-white',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
      {/* Foto */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mx-auto mb-3 border-2 border-[#1e3a5f]/10">
        {representante.foto_url ? (
          <img 
            src={representante.foto_url} 
            alt={representante.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/5">
            <User className="w-8 h-8 text-[#1e3a5f]/40" />
          </div>
        )}
      </div>

      {/* Nome */}
      <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">{representante.nome}</h3>

      {/* Cargo */}
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${cargoColors[representante.cargo] || 'bg-gray-200 text-gray-700'}`}>
        {representante.cargo}
      </span>

      {/* Localização */}
      <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
        <MapPin className="w-3 h-3" />
        <span className="line-clamp-1">{representante.cidade} - {representante.estado}</span>
      </div>
    </div>
  );
}