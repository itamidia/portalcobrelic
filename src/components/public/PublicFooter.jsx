import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

const footerLinks = {
  institucional: [
    { label: 'Sobre a COBRELIC', href: '/Sobre' },
    { label: 'Nossa História', href: '/Sobre' },
    { label: 'Diretoria', href: '/Sobre' },
    { label: 'Estatuto', href: '/Sobre' },
  ],
  servicos: [
    { label: 'Planos de Associação', href: '/Planos' },
    { label: 'Clube de Benefícios', href: '/ClubeBeneficios' },
    { label: 'Representantes', href: '/Representantes' },
    { label: 'Notícias', href: '/NoticiasPublico' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/Contato' },
    { label: 'Fale Conosco', href: '/Contato' },
    { label: 'Verificar Carteirinha', href: '/VerificarCarteirinha' },
    { label: 'Área do Associado', href: '/Login' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function PublicFooter() {
  return (
    <footer className="bg-[#0a1628] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/logo.png" 
                alt="COBRELIC" 
                className="h-20 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/70 text-sm mb-4 max-w-xs">
              Confederação Brasileira de Líderes Comunitários. 
              Representando e fortalecendo os líderes comunitários de todo o Brasil.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Institucional */}
          <div>
            <h4 className="font-bold text-white mb-4">Institucional</h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Serviços */}
          <div>
            <h4 className="font-bold text-white mb-4">Serviços</h4>
            <ul className="space-y-2">
              {footerLinks.servicos.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Suporte */}
          <div>
            <h4 className="font-bold text-white mb-4">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Mail className="w-4 h-4" />
            <span>contato@cobrelc.org.br</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Phone className="w-4 h-4" />
            <span>(11) 4000-0000</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <MapPin className="w-4 h-4" />
            <span>São Paulo, SP - Brasil</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2024 COBRELIC. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/Contato" className="text-white/60 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link to="/Contato" className="text-white/60 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
