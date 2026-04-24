import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { path: '/', label: 'Home' },
  { path: '/Representantes', label: 'Representantes' },
  { path: '/Sobre', label: 'Sobre' },
  { path: '/Planos', label: 'Planos' },
  { path: '/ClubeBeneficios', label: 'Clube de Benefícios' },
  { path: '/NoticiasPublico', label: 'Notícias' },
  { path: '/Contato', label: 'Contato' },
];

export default function PublicHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="COBRELIC" 
              className="h-13 w-auto object-contain mr-3"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-[#1e3a5f] font-bold'
                    : 'text-gray-700 hover:text-[#1e3a5f]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/Login" 
              className="text-[#1e3a5f] hover:text-[#152a45] font-medium flex items-center text-sm"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Login
            </Link>
            <Link 
              to="/Login?tab=cadastro" 
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Associe-se
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-2 rounded-lg font-medium ${
                    isActive(item.path)
                      ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
              <Link 
                to="/Login" 
                className="text-[#1e3a5f] font-medium flex items-center justify-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
              <Link 
                to="/Login?tab=cadastro" 
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-4 py-2 rounded-lg font-medium text-center flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Associe-se
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
