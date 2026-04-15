import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, User } from 'lucide-react';

export default function RepresentanteCard({ representante }) {
  const [expandido, setExpandido] = React.useState(false);
  
  const formatPhone = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const whatsappLink = `https://wa.me/55${representante.telefone?.replace(/\D/g, '')}`;
  const emailLink = `mailto:${representante.email}`;

  const cargoColors = {
    'Presidente Estadual': 'bg-[#d4af37] text-[#1e3a5f]',
    'Presidente Municipal': 'bg-[#1e3a5f] text-white',
    'Diretor': 'bg-blue-600 text-white',
    'Líder Comunitário': 'bg-emerald-600 text-white',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Foto */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4 border-4 border-[#1e3a5f]/10">
            {representante.foto_url ? (
              <img 
                src={representante.foto_url} 
                alt={representante.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/5">
                <User className="w-10 h-10 text-[#1e3a5f]/40" />
              </div>
            )}
          </div>

          {/* Nome */}
          <h3 className="font-bold text-lg text-gray-800 mb-2">{representante.nome}</h3>

          {/* Cargo */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 ${cargoColors[representante.cargo] || 'bg-gray-200 text-gray-700'}`}>
            {representante.cargo}
          </span>

          {/* Localização */}
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{representante.cidade} - {representante.estado}</span>
          </div>

          {/* Descrição */}
          {representante.descricao && (
            <div className="mb-4 w-full">
              <p className={`text-gray-600 text-sm text-left ${expandido ? "" : "line-clamp-3"}`}>
                {representante.descricao}
              </p>
              {representante.descricao.length > 150 && (
                <button
                  onClick={() => setExpandido(!expandido)}
                  className="text-[#1e3a5f] hover:text-[#d4af37] text-xs font-medium mt-1"
                >
                  {expandido ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          )}

          {/* Contatos */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Phone className="w-4 h-4" />
            <span>{formatPhone(representante.telefone)}</span>
          </div>

          {/* Botões de Contato */}
          <div className="flex gap-2 w-full">
            <Button 
              asChild
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex-1 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
            >
              <a href={emailLink}>
                <Mail className="w-4 h-4 mr-2" />
                E-mail
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}