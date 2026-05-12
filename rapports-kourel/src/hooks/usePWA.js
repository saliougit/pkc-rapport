import { useEffect, useState } from 'react'
import { checkForUpdates, onOnlineStatusChanged } from '../utils/pwaUtils'

/**
 * Hook pour gérer les mises à jour PWA
 * Retourne { hasUpdate, isOnline }
 */
export function usePWA() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Écouter les changements de connectivité
    onOnlineStatusChanged((online) => {
      setIsOnline(online)
    })

    // Vérifier les mises à jour au chargement
    checkForUpdates()

    // Vérifier les mises à jour toutes les heures
    const interval = setInterval(() => {
      checkForUpdates()
    }, 60 * 60 * 1000)

    // Écouter les mises à jour
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setHasUpdate(true)
      })
    }

    return () => clearInterval(interval)
  }, [])

  return { hasUpdate, isOnline }
}

/**
 * Hook pour afficher une notification de mise à jour
 */
export function useUpdateNotification() {
  const { hasUpdate, isOnline } = usePWA()

  const reloadApp = () => {
    window.location.reload()
  }

  return { hasUpdate, isOnline, reloadApp }
}
