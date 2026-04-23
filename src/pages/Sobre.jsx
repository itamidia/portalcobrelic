import React from 'react';
import { 
  Award,
  Users,
  Target,
  Heart,
  Globe,
  Shield,
  LogIn,
  UserPlus,
  ChevronRight,
  MapPin,
  Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sobre() {
  const valores = [
    {
      icon: Heart,
      titulo: 'Compromisso Social',
      descricao: 'Trabalhamos incansavelmente para fortalecer as comunidades e melhorar a vida dos cidadãos.'
    },
    {
      icon: Shield,
      titulo: 'Transparência',
      descricao: 'Agimos com ética, honestidade e total transparência em todas as nossas ações.'
    },
    {
      icon: Users,
      titulo: 'União',
      descricao: 'Juntos somos mais fortes. A união faz a força da nossa confederação.'
    },
    {
      icon: Target,
      titulo: 'Foco em Resultados',
      descricao: 'Buscamos sempre entregar resultados concretos e melhorias reais para a sociedade.'
    }
  ];

  const conquistas = [
    { numero: '50.000+', label: 'Associados' },
    { numero: '27', label: 'Estados' },
    { numero: '5.000+', label: 'Municípios' },
    { numero: '10+', label: 'Anos de Atuação' }
  ];

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
              <Link to="/Sobre" className="text-[#1e3a5f] font-semibold transition-colors">
                Sobre
              </Link>
              <Link to="/Representantes" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Representantes
              </Link>
              <Link to="/Planos" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
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
              <span className="text-sm font-medium">Nossa História</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Quem <span className="text-[#d4af37]">Somos</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              A COBRELIC é a maior confederação de líderes comunitários do Brasil, 
              unindo forças para transformar comunidades em todo o território nacional.
            </p>
          </div>
        </div>
      </section>

      {/* Presidente */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1e3a5f] rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Presidente Nacional
                </h2>
                <h3 className="text-2xl font-semibold text-[#d4af37] mb-6">
                  Wellington Andrade
                </h3>
                <div className="relative">
                  <Quote className="w-8 h-8 text-[#d4af37]/30 absolute -top-2 -left-2" />
                  <p className="text-white/90 leading-relaxed text-justify pl-6">
                    "Tenho 48 anos e me orgulho de ter nascido no Distrito Federal. 
                    Sou entusiasta das políticas públicas do terceiro setor, defensor 
                    popular e jornalista. Fui autor da primeira frente parlamentar 
                    em defesa, valorização e desenvolvimento dos líderes comunitários 
                    do Distrito Federal e cidades metropolitanas, no período de 2019 
                    a 2022, na CLDF.
                  </p>
                  <p className="text-white/90 leading-relaxed text-justify pl-6 mt-4">
                    Atualmente, estou presidente nacional da COBRELIC - Confederação 
                    Brasileira das Entidades e Lideranças Comunitárias. Tenho uma 
                    premissa especial: juntos e com Jesus somos mais fortes."
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/94796e554_Designsemnome81.png"
                    alt="Presidente Nacional Wellington Andrade"
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border-8 border-[#d4af37] shadow-2xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#d4af37] text-[#1e3a5f] px-6 py-2 rounded-full font-bold shadow-lg">
                    Presidente Nacional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-12 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {conquistas.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#d4af37] mb-2">
                  {item.numero}
                </div>
                <div className="text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nossos <span className="text-[#1e3a5f]">Valores</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Princípios que guiam nossas ações e definem quem somos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-4">
                  <valor.icon className="w-7 h-7 text-[#1e3a5f]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{valor.titulo}</h3>
                <p className="text-gray-600">{valor.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] rounded-2xl p-8 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
              <p className="text-white/90 leading-relaxed">
                Unir, fortalecer e representar os líderes comunitários do Brasil, 
                promovendo a valorização do trabalho voluntário e buscando 
                constantemente melhorias para as comunidades através de parcerias 
                estratégicas e representação política efetiva.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#d4af37] to-[#c4a030] rounded-2xl p-8 text-[#1e3a5f]">
              <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nossa Visão</h3>
              <p className="text-[#1e3a5f]/90 leading-relaxed">
                Ser reconhecida como a maior e mais influente confederação de 
                líderes comunitários da América Latina, transformando vidas 
                e comunidades através do trabalho colaborativo e da 
                representação de classe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Faça Parte dessa <span className="text-[#1e3a5f]">História</span>
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de líderes comunitários e faça parte da maior 
            confederação do Brasil. Juntos somos mais fortes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/Cadastro" 
              className="inline-flex items-center justify-center bg-[#1e3a5f] hover:bg-[#152a45] text-white px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Associe-se Agora
            </Link>
            <Link 
              to="/Contato" 
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#1e3a5f] px-8 py-4 rounded-xl font-semibold transition-colors border-2 border-[#1e3a5f]"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Entre em Contato
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
