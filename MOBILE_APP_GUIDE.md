# Guia: App Móvel COBRELIC

## Opção 1: PWA (Progressive Web App) - Mais Rápido
O usuário instala pelo navegador Chrome/Safari, sem precisar de loja.

### Como funciona:
1. Usuário acessa o site no celular
2. Chrome/Safari mostra opção "Adicionar à tela inicial"
3. App funciona como nativo (tela cheia, offline, push)

### Vantagens:
- ✅ Sem custo de loja (Play Store $25, App Store $99/ano)
- ✅ Atualizações instantâneas
- ✅ Funciona imediatamente

---

## Opção 2: App Nativo (Play Store + App Store)
Empacotar o site como app usando **Capacitor**.

### Passo 1: Instalar dependências
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Passo 2: Inicializar Capacitor
```bash
npx cap init "COBRELIC" "com.cobrelic.app" --web-dir dist
```

### Passo 3: Configurar capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cobrelic.app',
  appName: 'COBRELIC',
  webDir: 'dist',
  server: {
    // URL do seu site hospedado (Render, Vercel, etc)
    url: 'https://seu-site.com',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1e3a5f",
    },
  },
};

export default config;
```

### Passo 4: Build do projeto
```bash
npm run build
```

### Passo 5: Adicionar plataformas
```bash
# Android
npx cap add android

# iOS (só funciona no Mac)
npx cap add ios
```

### Passo 6: Abrir no Android Studio / Xcode
```bash
# Android
npx cap open android

# iOS (Mac apenas)
npx cap open ios
```

### Passo 7: Publicar nas lojas

#### Android (Play Store):
1. No Android Studio: Build → Generate Signed Bundle/APK
2. Criar keystore (chave de assinatura)
3. Upload no Google Play Console ($25 uma vez)

#### iOS (App Store):
1. No Xcode: Product → Archive
2. Upload via Transporter ou Xcode
3. Criar conta de desenvolvedor Apple ($99/ano)

---

## Alternativa: WebView Simples (menos recomendado)
Se quiser algo mais simples, pode usar React Native com WebView:

```javascript
// App.js
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView 
      source={{ uri: 'https://seu-site.com' }}
      style={{ flex: 1 }}
    />
  );
}
```

---

## Recomendação

**Comece com PWA** - é instantâneo e funciona bem.

Se precisar das lojas depois, use **Capacitor** (Opção 2).

---

## Recursos

- [Capacitor Docs](https://capacitorjs.com/docs)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Google Play Console](https://play.google.com/console)
- [Apple Developer](https://developer.apple.com/)
