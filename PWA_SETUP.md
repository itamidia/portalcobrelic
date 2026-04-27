# Configuração PWA - COBRELIC

## ✅ PWA Configurado!

As seguintes alterações foram feitas:

1. **manifest.json** - Configuração do app
2. **index.html** - Meta tags PWA + Service Worker
3. **sw.js** - Service Worker para funcionamento offline

## 🔧 Próximos Passos

### 1. Gerar Ícones PWA

Você precisa de 2 ícones PNG:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

**Opções para gerar:**

#### Opção A: Usar logo existente
Se tiver o logo da COBRELIC em alta resolução, redimensione para 192x192 e 512x512.

#### Opção B: Gerador online
1. Acesse: https://pwa-asset-generator.nicepkg.cn/ ou https://app-manifest.firebaseapp.com/
2. Faça upload de uma imagem quadrada (logo)
3. Baixe os ícones gerados
4. Coloque na pasta `public/`

#### Opção C: Favicon.io
1. Acesse: https://favicon.io/favicon-generator/
2. Digite "C" ou "COBRELIC"
3. Baixe o pacote
4. Use os arquivos PNG

### 2. Testar PWA

#### No PC (Chrome):
1. Abra o DevTools (F12)
2. Vá em "Application" → "Manifest"
3. Verifique se está tudo verde

#### No Android:
1. Acesse o site no Chrome
2. Menu (3 pontos) → "Adicionar à tela inicial"
3. O app aparece na home!

#### No iPhone:
1. Acesse no Safari
2. Compartilhar (ícone de compartilhamento)
3. "Adicionar à Tela de Início"

## 📱 Funcionalidades PWA

✅ Ícone na tela inicial  
✅ Tela cheia (sem barra de navegação)  
✅ Splash screen personalizada  
✅ Funciona offline (cache básico)  
✅ Theme color (#1e3a5f)  

## 🚀 Deploy

Após adicionar os ícones, faça deploy do projeto. O PWA funcionará automaticamente!

```bash
git add public/icon-192x192.png public/icon-512x512.png
git commit -m "add: icones PWA"
git push
```
