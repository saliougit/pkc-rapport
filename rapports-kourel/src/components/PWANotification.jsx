import { useEffect, useState } from 'react'
import { X, AlertCircle, Wifi, WifiOff } from 'lucide-react'

/**
 * Composant pour afficher les notifications d'état PWA
 */
export function PWANotification() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(!navigator.onLine)

  useEffect(() => {
    // Écouter les changements de connectivité
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Vérifier les mises à jour
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true)
              }
            })
          })
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const reloadApp = () => {
    window.location.reload()
  }

  return (
    <>
      {/* Notification mise à jour */}
      {hasUpdate && (
        <div className="fixed bottom-4 right-4 bg-vert-principal text-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-bottom">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Mise à jour disponible</h3>
              <p className="text-xs mt-1 opacity-90">Une nouvelle version est prête. Rechargez pour mettre à jour.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={reloadApp}
                  className="bg-white text-vert-principal px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition"
                >
                  Recharger
                </button>
                <button
                  onClick={() => setHasUpdate(false)}
                  className="text-white px-3 py-1 rounded text-xs hover:bg-white/20 transition"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification offline */}
      {!isOnline && showOffline && (
        <div className="fixed top-4 left-4 right-4 bg-rouge-alerte text-white rounded-lg shadow-lg p-3 z-50 animate-in slide-in-from-top">
          <div className="flex items-center gap-3 justify-center">
            <WifiOff size={18} />
            <span className="text-sm font-semibold">Vous êtes actuellement hors ligne. Les données seront synchronisées à la reconnexion.</span>
            <button
              onClick={() => setShowOffline(false)}
              className="ml-auto hover:bg-white/20 p-1 rounded transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
