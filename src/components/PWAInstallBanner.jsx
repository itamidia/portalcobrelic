import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple, X } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se é iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Capturar o evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, sempre mostrar o banner se não estiver instalado
    if (iOS && !isInstalled) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o PWA');
      setIsVisible(false);
    } else {
      console.log('Usuário recusou instalar o PWA');
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Instale o App COBRELIC</h3>
            <p className="text-xs text-gray-500">Acesso rápido e offline</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isIOS ? (
        // iOS - Instruções manuais
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Toque no botão de compartilhar <span className="font-medium">⬆️</span> abaixo e depois em <span className="font-medium">"Adicionar à Tela de Início"</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <Apple className="w-4 h-4" />
            <span>Safari → Compartilhar → Adicionar à Tela de Início</span>
          </div>
        </div>
      ) : (
        // Android/Chrome - Botão de instalação
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Instale nosso aplicativo para acesso rápido e notificações
          </p>
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Instalar Aplicativo
          </Button>
          <p className="text-xs text-center text-gray-400">
            Android • Chrome/Samsung Internet
          </p>
        </div>
      )}
    </div>
  );
}
