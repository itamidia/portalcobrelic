import React from 'react';
import { Shield, Play, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Marca a página como pública
CadastreSeInfo.public = true;

export default function CadastreSeInfo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/5c2541974_AssociaoNacionaldosLder4esComunitrios7.png" 
              alt="ANALC"
              className="w-16 h-16 rounded-xl object-contain bg-white"
            />
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
            Faça Parte da ANALC
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Associação Nacional dos Líderes Comunitários - Junte-se a milhares de líderes em todo o Brasil
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="aspect-video bg-gray-900 relative">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Vídeo Explicativo ANALC"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Conheça a ANALC
            </h2>
            <p className="text-gray-600">
              Assista ao vídeo e descubra como a Associação Nacional dos Líderes Comunitários 
              pode ajudar você a transformar sua comunidade.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1e3a5f]" />
            Benefícios de ser Associado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Carteirinha Digital de Identificação',
              'Acesso a Cursos e Capacitações',
              'Rede de Contatos Nacional',
              'Suporte Jurídico Especializado',
              'Participação em Eventos Exclusivos',
              'Descontos em Parceiros'
            ].map((beneficio, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{beneficio}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] rounded-xl p-8 text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pronto para fazer parte?
          </h2>
          <p className="text-white/70 mb-6">
            Associe-se agora e comece a aproveitar todos os benefícios
          </p>
          <Link to={createPageUrl('Cadastro')}>
            <Button 
              size="lg"
              className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-bold text-lg px-8"
            >
              Associar-se Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center pb-8">
          <Link 
            to={createPageUrl('Representantes')}
            className="text-[#1e3a5f] hover:text-[#d4af37] font-medium"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}