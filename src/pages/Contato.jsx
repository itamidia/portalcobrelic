import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  LogIn,
  UserPlus,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contatos')
        .insert([{
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          assunto: formData.assunto,
          mensagem: formData.mensagem,
          status: 'novo'
        }]);

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
              <Link to="/ClubeBeneficios" className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors">
                Clube de Benefícios
              </Link>
              <Link to="/Contato" className="text-[#1e3a5f] font-semibold transition-colors">
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
              <MessageSquare className="w-5 h-5 text-[#d4af37] mr-2" />
              <span className="text-sm font-medium">Fale Conosco</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Entre em <span className="text-[#d4af37]">Contato</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Estamos aqui para ajudar. Envie sua mensagem e responderemos em breve.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Send className="w-6 h-6 text-[#1e3a5f]" />
                Envie sua mensagem
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Seu nome"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.assunto}
                      onChange={(e) => setFormData({...formData, assunto: e.target.value})}
                      placeholder="Qual o assunto?"
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem *
                  </label>
                  <Textarea
                    required
                    value={formData.mensagem}
                    onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                    placeholder="Escreva sua mensagem aqui..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white h-12 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Info de Contato */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Informações de Contato</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Telefone</p>
                    <p className="text-gray-600">Em breve</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">E-mail</p>
                    <p className="text-gray-600">contato@cobrellic.org.br</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Endereço</p>
                    <p className="text-gray-600">Brasília, DF - Brasil</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Horário de Atendimento</p>
                    <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Redes Sociais
              </h3>
              <p className="text-white/80 mb-4">
                Siga-nos nas redes sociais e fique por dentro das novidades.
              </p>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>
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
