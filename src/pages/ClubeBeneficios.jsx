import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, CheckCircle, LogIn, UserPlus, Award, Stethoscope, ShoppingBag } from 'lucide-react';
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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/src/assets/logo.png" 
                alt="COBRELIC" 
                className="h-20 w-auto object-contain mr-3"
              />
            </Link>
            
            {/* Navigation Pública */}
            <nav className="hidden sm:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Home
              </Link>
              <Link to="/Sobre" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Sobre
              </Link>
              <Link to="/Representantes" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Representantes
              </Link>
              <Link to="/Planos" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Planos
              </Link>
              <Link to="/ClubeBeneficios" className="text-[#1e3a5f] font-semibold transition-colors">
                Clube de Benefícios
              </Link>
              <Link to="/Contato" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Contato
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/Login" 
                className="flex items-center text-[#1e3a5f] hover:text-[#d4af37] font-medium transition-colors"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Entrar
              </Link>
              <Link 
                to="/Login?tab=cadastro" 
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Associe-se
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5 text-[#d4af37] mr-2" />
              <span className="text-sm font-medium">Benefícios Exclusivos</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-10 h-10 text-red-500" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                S.O.S <span className="text-[#d4af37]">VIDAS PREMIUM</span>
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Clube de Benefícios exclusivo para líderes comunitários da COBRELIC.
              Telemedicina e descontos em +30 mil estabelecimentos.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Video Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12">
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
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-2xl p-8 md:p-12 mb-12">
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
              <Stethoscope className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Telemedicina Familiar</h3>
              <p className="text-white/80 text-base">Consultas médicas online 24h para você e toda sua família, com atendimento rápido e profissionais qualificados.</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <ShoppingBag className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Clube de Economia</h3>
              <p className="text-white/80 text-base">Descontos exclusivos em mais de 30 mil estabelecimentos em todo Brasil, incluindo farmácias, clínicas e laboratórios.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Faça Parte da COBRELIC
          </h2>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Associe-se agora e tenha acesso a todos esses benefícios exclusivos para líderes comunitários.
          </p>
          <Link to="/Cadastro">
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
      <footer className="bg-gray-900 text-gray-400 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/src/assets/logo.png" 
                  alt="COBRELIC" 
                  className="h-10 w-auto object-contain mr-2"
                />
                <span className="text-white font-bold">COBRELIC</span>
              </div>
              <p className="text-sm">
                Confederação Brasileira de Líderes Comunitários
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/Login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/Cadastro" className="hover:text-white transition-colors">Associar-se</Link></li>
                <li><Link to="/Representantes" className="hover:text-white transition-colors">Representantes</Link></li>
                <li><Link to="/Sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Informações</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/Planos" className="hover:text-white transition-colors">Planos</Link></li>
                <li><Link to="/ClubeBeneficios" className="hover:text-white transition-colors">Clube de Benefícios</Link></li>
                <li><Link to="/Contato" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <p className="text-sm">contato@cobrellic.org.br</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 COBRELIC. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}