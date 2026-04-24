/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import AdminAnuncios from './pages/AdminAnuncios';
import AdminAprovacoes from './pages/AdminAprovacoes';
import AdminAprovarPresidentes from './pages/AdminAprovarPresidentes';
import AdminAssociados from './pages/AdminAssociados';
import AdminBeneficios from './pages/AdminBeneficios';
import AdminCarteirinhas from './pages/AdminCarteirinhas';
import AdminConfiguracoes from './pages/AdminConfiguracoes';
import AdminDiretoria from './pages/AdminDiretoria';
import AdminFinanceiro from './pages/AdminFinanceiro';
import AdminLogin from './pages/AdminLogin';
import AdminMinhaEquipe from './pages/AdminMinhaEquipe';
import AdminNoticias from './pages/AdminNoticias';
import AdminNotificacoes from './pages/AdminNotificacoes';
import AdminPlanos from './pages/AdminPlanos';
import AdminRepresentantes from './pages/AdminRepresentantes';
import AdminVideoClube from './pages/AdminVideoClube';
import Beneficios from './pages/Beneficios';
import CadastreSeInfo from './pages/CadastreSeInfo';
import Cadastro from './pages/Cadastro';
import CadastroDiretoria from './pages/CadastroDiretoria';
import CadastroPresidente from './pages/CadastroPresidente';
import Carteirinha from './pages/Carteirinha';
import CidadeDetalhes from './pages/CidadeDetalhes';
import ClubeBeneficios from './pages/ClubeBeneficios';
import Contato from './pages/Contato';
import Sobre from './pages/Sobre';
import PlanosPublico from './pages/PlanosPublico';
import Dashboard from './pages/Dashboard';
import Financeiro from './pages/Financeiro';
import Home from './pages/Home';
import NoticiasPublico from './pages/NoticiasPublico';
import NoticiaDetalhes from './pages/NoticiaDetalhes';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Planos from './pages/Planos';
import VerificarCarteirinha from './pages/VerificarCarteirinha';
import Representantes from './pages/Representantes';
import Associados from './pages/Associados';
import Anuncios from './pages/Anuncios';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminAnuncios": AdminAnuncios,
    "AdminAprovacoes": AdminAprovacoes,
    "AdminAprovarPresidentes": AdminAprovarPresidentes,
    "AdminAssociados": AdminAssociados,
    "AdminBeneficios": AdminBeneficios,
    "AdminCarteirinhas": AdminCarteirinhas,
    "AdminConfiguracoes": AdminConfiguracoes,
    "AdminDiretoria": AdminDiretoria,
    "AdminFinanceiro": AdminFinanceiro,
    "AdminLogin": AdminLogin,
    "AdminMinhaEquipe": AdminMinhaEquipe,
    "AdminNoticias": AdminNoticias,
    "AdminNotificacoes": AdminNotificacoes,
    "AdminPlanos": AdminPlanos,
    "AdminRepresentantes": AdminRepresentantes,
    "AdminVideoClube": AdminVideoClube,
    "Beneficios": Beneficios,
    "CadastreSeInfo": CadastreSeInfo,
    "Cadastro": Cadastro,
    "CadastroDiretoria": CadastroDiretoria,
    "CadastroPresidente": CadastroPresidente,
    "Carteirinha": Carteirinha,
    "CidadeDetalhes": CidadeDetalhes,
    "ClubeBeneficios": ClubeBeneficios,
    "Contato": Contato,
    "Sobre": Sobre,
    "PlanosPublico": PlanosPublico,
    "Dashboard": Dashboard,
    "Financeiro": Financeiro,
    "Home": Home,
    "Login": Login,
    "NoticiasPublico": NoticiasPublico,
    "NoticiaDetalhes": NoticiaDetalhes,
    "Perfil": Perfil,
    "Planos": Planos,
    "VerificarCarteirinha": VerificarCarteirinha,
    "Representantes": Representantes,
    "Associados": Associados,
    "Anuncios": Anuncios,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};