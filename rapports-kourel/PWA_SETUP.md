# ✅ PWA (Progressive Web App) Configuration

## 🎯 Qu'est-ce qu'une PWA ?

Une **Progressive Web App (PWA)** est une application web qui fonctionne comme une application native :
- ✅ **Installable** sur le téléphone (home screen)
- ✅ **Fonctionne hors ligne** grâce au service worker
- ✅ **Mise à jour automatique** des données en arrière-plan
- ✅ **Notifications push** (optionnel)
- ✅ **Accès rapide** sans navigateur

---

## 📋 Configuration installée

### Plugins
- ✅ **vite-plugin-pwa** : Gère toute la configuration PWA

### Fichiers créés

1. **vite.config.js**
   - Configuration du plugin PWA
   - Manifest.json auto-généré
   - Workbox pour caching intelligent

2. **index.html**
   - Meta tags PWA
   - Apple mobile support
   - Manifest link

3. **src/main.jsx**
   - Registration du Service Worker
   - Callbacks de mise à jour

4. **src/components/PWANotification.jsx**
   - Notifications de mise à jour
   - État connecté/hors ligne
   - Interface utilisateur

5. **src/hooks/usePWA.js**
   - Hook React pour l'état PWA
   - Gestion des mises à jour

6. **src/utils/pwaUtils.js**
   - Fonctions utilitaires PWA
   - Vérification de connectivité

---

## 🚀 Utilisation

### Pour les utilisateurs (mobile/bureau)

#### **Installation sur mobile**
1. Ouvrir l'app dans un navigateur (Chrome, Firefox, Safari iOS 15+)
2. Cliquer sur le menu → "Ajouter à l'écran d'accueil"
3. Confirmer
4. L'app apparaît comme une application native ! 📱

#### **Installation sur bureau**
- **Chrome** : Cliquer sur l'icône + dans la barre d'adresse
- **Edge** : Cliquer sur l'icône + dans la barre d'adresse
- **Firefox** : Cliquer sur le menu (trois points) → "Installer"

#### **Utilisation hors ligne**
- Une fois installée, l'app fonctionne hors ligne
- Les données en cache restent accessibles
- À la reconnexion, les données se synchronisent

### Pour les développeurs

#### **Démarrer en mode développement**
```bash
npm run dev
```

#### **Tester la PWA en développement**
1. Ouvrir DevTools (F12)
2. Aller dans "Application" → "Service Workers"
3. Cocher "Update on reload" pour tester les mises à jour

#### **Construire pour la production**
```bash
npm run build
```

#### **Tester la build en local**
```bash
npm run preview
```

---

## 🔧 Configuration disponible

### Dans `vite.config.js`

**Manifest.json** :
```js
{
  name: "Rapports Kourel - DMN",
  short_name: "Rapports Kourel",
  description: "Application de gestion des rapports...",
  theme_color: "#16824E",
  background_color: "#FFFFFF",
  display: "standalone"
}
```

**Caching automatique** :
- API calls : Réseau en priorité, cache en fallback (5 min)
- Google Fonts : Cache en priorité, jamais expirable

---

## 📱 Ajouter des icônes personnalisées

Pour que la PWA s'installe correctement avec les icônes, créez ces fichiers dans `public/images/` :

```
public/images/
├── logo-dmn.png (existant)
├── icon-192.png (carré 192x192)
├── icon-512.png (carré 512x512)
├── icon-maskable-192.png (masquable 192x192)
├── icon-maskable-512.png (masquable 512x512)
└── apple-touch-icon.png (180x180 pour iOS)
```

**Générer les icônes** :
- Utiliser [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Uploader votre logo
- Télécharger les icônes générées

---

## 🔐 Notifications en temps réel

Les notifications PWA peuvent être intégrées pour :
- Nouvelles données à synchroniser
- Rappels de rapports à remplir
- Mises à jour critiques

Exemple (non implémenté) :
```javascript
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Mise à jour', {
    body: 'Vos données ont été synchronisées',
    icon: '/images/icon-192.png'
  })
}
```

---

## ✨ Bénéfices de cette PWA

| Feature | Avant | Après |
|---------|-------|-------|
| Installation | Browser only | Installation app |
| Hors ligne | ❌ Non | ✅ Oui |
| Performance | Normal | Très rapide (cache) |
| Notifications | ❌ Non | ✅ Oui (optionnel) |
| Mise à jour | Manuel (F5) | Automatique |
| Taille | N/A | ~50KB (petit) |

---

## 📊 Vérifier que tout fonctionne

1. **DevTools → Application → Manifest**
   - Doit afficher le manifest.json avec tous les champs

2. **DevTools → Application → Service Workers**
   - Doit afficher le service worker "activated"

3. **DevTools → Storage → Cache Storage**
   - Doit avoir un cache "static-v1"

4. **Lighthouse audit**
   - DevTools → Lighthouse → Analyser
   - Score PWA devrait être 90+

---

## 🐛 Troubleshooting

**La PWA ne s'installe pas ?**
- Vérifier HTTPS (obligatoire en production)
- Vérifier le manifest.json
- Vérifier les icônes existent

**Le service worker ne se met à jour pas ?**
- Aller dans DevTools → Application → Service Workers
- Cliquer sur "Unregister"
- Recharger la page

**Les données en cache ne s'effacent pas ?**
- DevTools → Application → Storage → Clear site data

---

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-plugin-pwa.netlify.app/)
- [Manifest Generator](https://www.pwabuilder.com/imageGenerator)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Voilà ! Ton app est maintenant une PWA complète ! 🚀**
