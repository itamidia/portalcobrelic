import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import { Toaster } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const pagesWithoutNav = ['Cadastro', 'VerificarCarteirinha', 'AdminLogin', 'Admin', 'AdminAssociados', 'AdminRepresentantes', 'AdminFinanceiro', 'AdminBeneficios', 'AdminNotificacoes', 'AdminConfiguracoes', 'Representantes', 'AdminVideoClube', 'AdminAprovacoes', 'AdminAnuncios', 'AdminNoticias', 'AdminCarteirinhas', 'CadastroPresidente', 'AdminAprovarPresidentes', 'AdminMinhaEquipe', 'CadastroDiretoria', 'AdminDiretoria', 'Associados'];

const publicPages = ['Representantes', 'VerificarCarteirinha', 'Cadastro', 'ClubeBeneficios', 'AdminLogin', 'CidadeDetalhes', 'CadastroPresidente', 'CadastroDiretoria', 'Associados'];

const userPages = ['Dashboard', 'Perfil', 'Carteirinha', 'Beneficios'];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const showNav = !pagesWithoutNav.includes(currentPageName);
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    // Se é página pública, não precisa verificar autenticação
    if (isPublicPage) {
      setChecking(false);
      return;
    }

    // Aguardar carregamento da autenticação
    if (!isLoadingAuth) {
      // Se não está autenticado e a página não é pública, redireciona para login
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      setChecking(false);
    }
  }, [currentPageName, isPublicPage, isAuthenticated, isLoadingAuth, navigate]);

  // Mostra loading enquanto verifica autenticação
  if ((checking || isLoadingAuth) && !isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e3a5f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {children}
      {showNav && <BottomNav />}
    </div>
  );
}