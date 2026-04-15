import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Wallet, 
  Gift, 
  Bell, 
  Settings,
  LayoutDashboard,
  CreditCard,
  LogOut,
  UserCheck,
  Megaphone,
  Newspaper,
  ClipboardCheck,
  Video
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Mapeamento de rotas admin
const adminRoutes = {
  'Admin': '/admin',
  'AdminAprovacoes': '/admin/aprovacoes',
  'AdminAprovarPresidentes': '/admin/aprovar-presidentes',
  'AdminDiretoria': '/admin/diretoria',
  'AdminMinhaEquipe': '/admin/minha-equipe',
  'AdminAssociados': '/admin/associados',
  'AdminRepresentantes': '/admin/representantes',
  'AdminFinanceiro': '/admin/financeiro',
  'AdminBeneficios': '/admin/beneficios',
  'AdminCarteirinhas': '/admin/carteirinhas',
  'AdminAnuncios': '/admin/anuncios',
  'AdminNoticias': '/admin/noticias',
  'AdminVideoClube': '/admin/video-clube',
  'AdminNotificacoes': '/admin/notificacoes',
  'AdminConfiguracoes': '/admin/configuracoes',
};

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Admin' },
  { name: 'Aprovações', icon: ClipboardCheck, page: 'AdminAprovacoes' },
  { name: 'Aprovar Presidentes', icon: Shield, page: 'AdminAprovarPresidentes', roles: ['admin', 'Presidente Estadual'] },
  { name: 'Gerenciar Diretoria', icon: UserCheck, page: 'AdminDiretoria', roles: ['Presidente Municipal'] },
  { name: 'Minha Equipe', icon: Users, page: 'AdminMinhaEquipe', roles: ['Presidente Estadual'] },
  { name: 'Líderes Comunitários', icon: Users, page: 'AdminAssociados' },
  { name: 'Representantes', icon: UserCheck, page: 'AdminRepresentantes' },
  { name: 'Financeiro', icon: Wallet, page: 'AdminFinanceiro' },
  { name: 'Benefícios', icon: Gift, page: 'AdminBeneficios' },
  { name: 'Carteirinhas', icon: CreditCard, page: 'AdminCarteirinhas' },
  { name: 'Anúncios', icon: Megaphone, page: 'AdminAnuncios' },
  { name: 'Notícias', icon: Newspaper, page: 'AdminNoticias' },
  { name: 'Vídeo Clube', icon: Video, page: 'AdminVideoClube' },
  { name: 'Notificações', icon: Bell, page: 'AdminNotificacoes' },
  { name: 'Configurações', icon: Settings, page: 'AdminConfiguracoes' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [representante, setRepresentante] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Buscar representante pelo user_id
          const { data: foundRep } = await supabase
            .from('representantes')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          setRepresentante(foundRep);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1e3a5f] text-white flex flex-col z-50">
      {/* Header */}
      <div className="p-5 border-b border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693099089062f3cc56b4fd72/0678759ba_BlueModernBusinessCard2.png"
            alt="COBRELIC"
            className="h-10 w-auto object-contain"
          />
        </div>
        <p className="text-xs text-white/80 font-medium tracking-wide uppercase">Painel Administrativo</p>
        {user && (
          <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/10">
            <p className="text-sm font-semibold text-white">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
            <p className="text-xs text-white/70 truncate">{user.email}</p>
            {representante && (
              <p className="text-xs text-[#d4af37] mt-1 font-medium bg-[#d4af37]/10 px-2 py-0.5 rounded inline-block">{representante.cargo}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Verifica se o item tem restrição de roles
          if (item.roles) {
            const hasAccess = 
              item.roles.includes('admin') && user?.role === 'admin' ||
              item.roles.includes(representante?.cargo) && representante?.ativo;
            
            if (!hasAccess) return null;
          }

          const route = adminRoutes[item.page];
          const isActive = location.pathname === route || location.pathname.startsWith(route + '/');
          return (
            <Link
              key={item.page}
              to={route}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-semibold shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#d4af37]' : 'text-white/70'}`} />
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}