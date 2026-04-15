import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Heart, Shield, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Marca a página como pública
ClubeBeneficios.public = true;

export default function ClubeBeneficios() {
  const { data: videos } = useQuery({
    queryKey: ['video-clube-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_clube')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      return data || [];
    },
  });

  const video = videos && videos.length > 0 ? videos[0] : null;

  // Função para converter URL do YouTube para embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={createPageUrl('Representantes')}>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  Fazer Login
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button 
                  className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] font-semibold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Associe-se
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-red-500" />
            <h1 className="text-white text-3xl md:text-4xl font-bold">
              S.O.S VIDAS PREMIUM
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Clube de Benefícios exclusivo para líderes comunitários da COBRELIC
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Video Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Conheça o Clube de Benefícios
          </h2>
          
          <div className="aspect-video w-full max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden">
            {video && video.url_video ? (
              <iframe
                src={getEmbedUrl(video.url_video)}
                title={video.titulo || 'Vídeo explicativo'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f]">
                <div className="text-center text-white p-8">
                  <Shield className="w-20 h-20 mx-auto mb-4 text-[#d4af37]" />
                  <p className="text-xl font-semibold mb-2">Vídeo Explicativo</p>
                  <p className="text-white/60">Em breve o vídeo estará disponível aqui</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-2xl p-8 md:p-12 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#d4af37] mb-3 text-center">
            Seus Benefícios Exclusivos
          </h2>
          <div className="text-center mb-8">
            <p className="text-white/90 text-lg mb-2">Por apenas</p>
            <p className="text-[#d4af37] text-4xl md:text-5xl font-extrabold">R$ 30,00</p>
            <p className="text-white/70 text-base">por mês</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <CheckCircle className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Telemedicina Familiar</h3>
              <p className="text-white/80 text-base">Consultas médicas online 24h para você e toda sua família, com atendimento rápido e profissionais qualificados.</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <CheckCircle className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Clube de Economia</h3>
              <p className="text-white/80 text-base">Descontos exclusivos em mais de 30 mil estabelecimentos em todo Brasil, incluindo farmácias, clínicas e laboratórios.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Faça Parte da COBRELIC
          </h2>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Associe-se agora e tenha acesso a todos esses benefícios exclusivos para líderes comunitários.
          </p>
          <Link to="/cadastro">
            <Button 
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold text-lg px-10 py-4 h-auto"
            >
              <Users className="w-5 h-5 mr-2" />
              Associe-se Agora
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1e3a5f] py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-[#d4af37]" />
            <span className="text-white font-bold">COBRELIC</span>
          </div>
          <p className="text-white/60 text-sm">
            Associação Nacional dos Líderes Comunitários
          </p>
        </div>
      </div>
    </div>
  );
}