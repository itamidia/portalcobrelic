import React from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { 
  Check,
  Star,
  Crown,
  Zap,
  LogIn,
  UserPlus,
  ChevronRight,
  Award,
  Shield,
  Heart,
  Phone,
  Stethoscope,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlanosPublico() {
  const { data: planos, isLoading } = useQuery({
    queryKey: ['planos-publicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const beneficios = [
    { icon: Stethoscope, titulo: 'Telemedicina', descricao: 'Atendimento médico online 24h' },
    { icon: ShoppingBag, titulo: 'Descontos', descricao: '+30 mil estabelecimentos' },
    { icon: Shield, titulo: 'Proteção', descricao: 'Benefícios exclusivos' },
    { icon: Heart, titulo: 'Bem-estar', descricao: 'Cuidado com sua saúde' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
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
              <Link to="/Planos" className="text-[#1e3a5f] font-semibold transition-colors">
                Planos
              </Link>
              <Link to="/ClubeBeneficios" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
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
              <span className="text-sm font-medium">Escolha seu Plano</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Planos <span className="text-[#d4af37]">COBRELIC</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Escolha o plano ideal para você e tenha acesso a benefícios exclusivos, 
              telemedicina e descontos em milhares de estabelecimentos.
            </p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planos?.map((plano, index) => (
              <div 
                key={plano.id} 
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                  index === 1 ? 'ring-4 ring-[#d4af37] transform md:-translate-y-4' : ''
                }`}
              >
                {index === 1 && (
                  <div className="absolute top-0 right-0 bg-[#d4af37] text-[#1e3a5f] px-4 py-1 rounded-bl-xl font-bold text-sm">
                    MAIS POPULAR
                  </div>
                )}
                
                <div className={`p-6 ${plano.cor_destaque || 'bg-[#1e3a5f]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {index === 0 && <Star className="w-6 h-6 text-[#d4af37]" />}
                    {index === 1 && <Crown className="w-6 h-6 text-[#d4af37]" />}
                    {index === 2 && <Zap className="w-6 h-6 text-[#d4af37]" />}
                    <h3 className="text-2xl font-bold text-[#1e3a5f]">{plano.titulo}</h3>
                  </div>
                  <p className="text-[#1e3a5f]/80 text-sm">{plano.descricao}</p>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-[#1e3a5f]">
                      R$ {plano.valor}
                    </div>
                    <div className="text-gray-500">por mês</div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {(plano.beneficios || []).map((beneficio, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{beneficio}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/Login"
                    className="block"
                  >
                    <Button 
                      className={`w-full h-12 font-semibold ${
                        index === 1 
                          ? 'bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f]' 
                          : 'bg-[#1e3a5f] hover:bg-[#152a45] text-white'
                      }`}
                    >
                      Assinar Agora
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Benefícios <span className="text-[#1e3a5f]">Inclusos</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todos os planos incluem acesso aos benefícios do Clube COBRELIC
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <beneficio.icon className="w-8 h-8 text-[#1e3a5f]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{beneficio.titulo}</h3>
                <p className="text-gray-600 text-sm">{beneficio.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ainda tem <span className="text-[#d4af37]">dúvidas?</span>
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e tire todas as suas dúvidas sobre os planos 
            e benefícios da COBRELIC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/Contato" 
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-[#1e3a5f] px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Falar com Atendimento
            </Link>
            <Link 
              to="/Cadastro" 
              className="inline-flex items-center justify-center bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f] px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Associar-se Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/logo.png" 
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
