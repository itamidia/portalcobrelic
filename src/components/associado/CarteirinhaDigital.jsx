import React from 'react';
import { QrCode, Shield, User } from 'lucide-react';

export default function CarteirinhaDigital({ associado, showFull = true }) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `${window.location.origin}/VerificarCarteirinha?codigo=${associado?.codigo_carteirinha || ''}`
  )}`;

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const isAtivo = associado?.status_assinatura === 'ativo';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] p-1">
      {/* Golden border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/30 via-[#f4d03f]/20 to-[#d4af37]/30 opacity-50" />
      
      <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-wide">COBRELIC</h3>
              <p className="text-white/60 text-xs">Associação Nacional</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isAtivo 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isAtivo ? 'REGULAR' : 'PENDENTE'}
          </div>
        </div>

        {/* User Info */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Nome do Associado</p>
              <p className="text-white font-semibold text-lg">{associado?.nome_completo || 'Nome não informado'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">CPF</p>
                <p className="text-white font-medium">{formatCPF(associado?.cpf)}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Nº Registro</p>
                <p className="text-[#d4af37] font-mono font-bold">{associado?.numero_registro || '---'}</p>
              </div>
            </div>
          </div>

          {showFull && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-24 h-24"
                />
              </div>
              <p className="text-white/40 text-[10px] mt-2 text-center">Escaneie para verificar</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-white/40 text-xs">Carteirinha Digital</p>
          <p className="text-[#d4af37]/80 text-xs font-medium">
            Válido enquanto ativo
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d4af37]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}