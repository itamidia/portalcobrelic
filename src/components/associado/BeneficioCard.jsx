import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Check, Gift, Heart, Wallet, GraduationCap, ShoppingBag, Stethoscope } from 'lucide-react';

const iconMap = {
  Gift: Gift,
  Heart: Heart,
  Wallet: Wallet,
  GraduationCap: GraduationCap,
  ShoppingBag: ShoppingBag,
  Stethoscope: Stethoscope,
};

export default function BeneficioCard({ beneficio, isAtivo }) {
  const IconComponent = iconMap[beneficio.icone] || Gift;

  const handleClick = () => {
    if (isAtivo && beneficio.link_externo) {
      window.open(beneficio.link_externo, '_blank');
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isAtivo 
        ? 'hover:shadow-lg' 
        : 'opacity-75 grayscale'
    }`}>
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-7 h-7 text-[#d4af37]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">{beneficio.titulo}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{beneficio.descricao}</p>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-3">
          {beneficio.destaques?.map((destaque, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-gray-700 text-sm">{destaque}</span>
            </div>
          ))}
        </div>

        {/* Action button - apenas quando ativo */}
        {isAtivo && (
          <div className="px-6 pb-6">
            <Button
              onClick={handleClick}
              className="w-full h-12 text-base font-semibold bg-[#d4af37] hover:bg-[#c9a432] text-[#1e3a5f]"
            >
              Acessar Benefício
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}