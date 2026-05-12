import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Enregistrer le Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('PWA: Une mise à jour est disponible')
  },
  onOfflineReady() {
    console.log('PWA: Prêt pour une utilisation hors ligne')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
