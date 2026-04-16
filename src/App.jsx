import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      {/* Páginas públicas (não precisam de auth) */}
      <Route path="/Login" element={<Pages.Login />} />
      <Route path="/Cadastro" element={<Pages.Cadastro />} />
      <Route path="/VerificarCarteirinha" element={<Pages.VerificarCarteirinha />} />
      <Route path="/CidadeDetalhes" element={<Pages.CidadeDetalhes />} />
      <Route path="/Representantes" element={<Pages.Representantes />} />
      <Route path="/Beneficios" element={
        <LayoutWrapper currentPageName="Beneficios">
          <Pages.Beneficios />
        </LayoutWrapper>
      } />
      <Route path="/admin/login" element={<Pages.AdminLogin />} />
      <Route path="/admin" element={<Pages.Admin />} />
      <Route path="/admin/aprovacoes" element={<Pages.AdminAprovacoes />} />
      <Route path="/admin/aprovar-presidentes" element={<Pages.AdminAprovarPresidentes />} />
      <Route path="/admin/anuncios" element={<Pages.AdminAnuncios />} />
      <Route path="/admin/associados" element={<Pages.AdminAssociados />} />
      <Route path="/admin/beneficios" element={<Pages.AdminBeneficios />} />
      <Route path="/admin/carteirinhas" element={<Pages.AdminCarteirinhas />} />
      <Route path="/admin/configuracoes" element={<Pages.AdminConfiguracoes />} />
      <Route path="/admin/diretoria" element={<Pages.AdminDiretoria />} />
      <Route path="/admin/financeiro" element={<Pages.AdminFinanceiro />} />
      <Route path="/admin/minha-equipe" element={<Pages.AdminMinhaEquipe />} />
      <Route path="/admin/noticias" element={<Pages.AdminNoticias />} />
      <Route path="/admin/notificacoes" element={<Pages.AdminNotificacoes />} />
      <Route path="/admin/representantes" element={<Pages.AdminRepresentantes />} />
      <Route path="/admin/video-clube" element={<Pages.AdminVideoClube />} />
      
      {/* Páginas protegidas (precisam de auth) */}
      <Route path="/" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        ) : (
          <Navigate to="/Login" replace />
        )
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        // Pular páginas já definidas como públicas
        // Pular páginas já definidas como públicas ou com rotas explícitas
        const publicPages = ['Login', 'Cadastro', 'VerificarCarteirinha', 'CidadeDetalhes', 'Representantes', 'Beneficios'];
        const adminPages = ['Admin', 'AdminLogin', 'AdminAprovacoes', 'AdminAprovarPresidentes', 'AdminAnuncios', 'AdminAssociados', 'AdminBeneficios', 'AdminCarteirinhas', 'AdminConfiguracoes', 'AdminDiretoria', 'AdminFinanceiro', 'AdminMinhaEquipe', 'AdminNoticias', 'AdminNotificacoes', 'AdminRepresentantes', 'AdminVideoClube'];
        if (publicPages.includes(path) || adminPages.includes(path)) {
          return null;
        }
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              isAuthenticated ? (
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              ) : (
                <Navigate to="/Login" replace />
              )
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
