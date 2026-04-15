import React from 'react';
import { Radio } from 'lucide-react';

export default function RadioPlayer() {
  return (
    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
      <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center flex-shrink-0">
        <Radio className="w-6 h-6 text-[#1e3a5f]" />
      </div>
      <div>
        <p className="text-white font-bold text-lg">Rede de Rádios Social Brasil</p>
        <p className="text-white/70 text-sm">Clique para ouvir ao vivo</p>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-white/70 text-xs">AO VIVO</span>
      </div>
    </div>
  );
}