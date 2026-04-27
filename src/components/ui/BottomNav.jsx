import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gift, CreditCard, User, Wallet, Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';

const navItems = [
  { name: 'Home', icon: Home, page: 'Dashboard' },
  { name: 'Benefícios', icon: Gift, page: 'Beneficios' },
  { name: 'Notificações', icon: Bell, page: 'Notificacoes' },
  { name: 'Financeiro', icon: Wallet, page: 'Financeiro' },
  { name: 'Perfil', icon: User, page: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.page);
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-[#1e3a5f]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}