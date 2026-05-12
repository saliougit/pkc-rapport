// Utilitaires PWA pour gérer les service workers et les mises à jour

export function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker enregistré ✅', registration);
        
        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
        
      }).catch(error => {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      });
    });
  }
}

export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
      }
    });
  }
}

export function showUpdatePrompt(onUpdate) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              console.log('Nouvelle version disponible');
              if (onUpdate) {
                onUpdate();
              }
            }
          });
        });
      }
    });
  }
}

export async function unregisterPWA() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker désactivé');
    }
  }
}

// Vérifier la connectivité
export function isOnline() {
  return navigator.onLine;
}

// Écouter les changements de connectivité
export function onOnlineStatusChanged(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}
