import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Gift, 
  CreditCard, 
  MapPin, 
  ChevronRight,
  Award,
  Heart,
  Globe,
  UserPlus
} from 'lucide-react';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PWAInstallBanner from '../components/PWAInstallBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f] text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4af37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Award className="w-5 h-5 text-[#d4af37] mr-2" />
                <span className="text-sm font-medium">+50.000 associados em todo Brasil</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Junte-se à maior{' '}
                <span className="text-[#d4af37]">confederação</span>{' '}
                de líderes comunitários
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Faça parte da COBRELIC e tenha acesso a benefícios exclusivos, 
                representação estadual e municipal, e muito mais.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/Login?tab=cadastro" 
                  className="bg-[#d4af37] hover:bg-[#b8962f] text-[#1e3a5f] px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Quero me Associar
                </Link>
                <Link 
                  to="/Representantes" 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Encontrar Representante
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-[#d4af37]" />
                  <span>Segurança garantida</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-[#d4af37]" />
                  <span>Benefícios exclusivos</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1 text-[#d4af37]" />
                  <span>Presente em todo Brasil</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <Users className="w-10 h-10 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-3xl font-bold">50k+</p>
                      <p className="text-sm text-gray-400">Associados</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <MapPin className="w-10 h-10 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-3xl font-bold">27</p>
                      <p className="text-sm text-gray-400">Estados</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <Gift className="w-10 h-10 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-3xl font-bold">100+</p>
                      <p className="text-sm text-gray-400">Benefícios</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center">
                      <Shield className="w-10 h-10 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-3xl font-bold">10+</p>
                      <p className="text-sm text-gray-400">Anos de história</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-[#d4af37] font-semibold text-sm uppercase tracking-wide mb-2">Por que se associar?</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">Benefícios Exclusivos</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Ao se tornar um associado da COBRELIC, você tem acesso a diversos benefícios 
              projetados para valorizar o trabalho dos líderes comunitários.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Carteirinha Digital</h3>
              <p className="text-gray-600">
                Identificação oficial da COBRELIC com validação em QR Code, 
                reconhecida em todo território nacional.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-6">
                <Gift className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Clube de Benefícios</h3>
              <p className="text-gray-600">
                Descontos exclusivos em farmácias, cursos, eventos e serviços 
                de parceiros em todo o Brasil.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Representação</h3>
              <p className="text-gray-600">
                Tenha acesso a representantes estaduais e municipais que 
                defendem seus interesses junto aos órgãos públicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-[#d4af37] font-semibold text-sm uppercase tracking-wide mb-2">Simples e rápido</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">Como se Associar</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#d4af37]">1</span>
              </div>
              <h4 className="font-bold text-[#1e3a5f] mb-2">Escolha seu Plano</h4>
              <p className="text-sm text-gray-600">Selecione o plano que melhor atende suas necessidades</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#d4af37]">2</span>
              </div>
              <h4 className="font-bold text-[#1e3a5f] mb-2">Preencha seu Cadastro</h4>
              <p className="text-sm text-gray-600">Informe seus dados pessoais de forma segura</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#d4af37]">3</span>
              </div>
              <h4 className="font-bold text-[#1e3a5f] mb-2">Realize o Pagamento</h4>
              <p className="text-sm text-gray-600">Pagamento seguro via PIX ou cartão de crédito</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#d4af37]">4</span>
              </div>
              <h4 className="font-bold text-[#1e3a5f] mb-2">Receba sua Carteirinha</h4>
              <p className="text-sm text-gray-600">Acesso imediato à carteirinha digital e benefícios</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/Planos" 
              className="inline-flex items-center bg-[#1e3a5f] hover:bg-[#152a45] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Ver Planos e Preços
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto para fazer parte da COBRELIC?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Junte-se a milhares de líderes comunitários que já desfrutam dos benefícios 
            de ser um associado COBRELIC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/Login?tab=cadastro" 
              className="bg-[#d4af37] hover:bg-[#b8962f] text-[#1e3a5f] px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Associe-se Agora
            </Link>
            <Link 
              to="/Representantes" 
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Encontrar Representante
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      
      {/* Banner de instalação PWA */}
      <PWAInstallBanner />
    </div>
  );
}