import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Désenregistrer tout service worker en mode dev (évite le cache fantôme)
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    for (const reg of regs) reg.unregister()
  })
}

if (!import.meta.env.DEV) {
  // Enregistrer le Service Worker seulement en production
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        location.reload()
      },
      onOfflineReady() {
        console.log('PWA: Prêt pour une utilisation hors ligne')
      },
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
