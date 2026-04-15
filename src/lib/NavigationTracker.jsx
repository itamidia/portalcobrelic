import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Post navigation changes to parent window
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    // Track navigation (opcional - desativado ao remover Base44)
    useEffect(() => {
        // Logging removido - Base44 não disponível
        // Pode ser implementado com Supabase Analytics se necessário
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}