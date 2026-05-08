import { useState, useEffect } from 'react'

/**
 * Hook personnalisé pour gérer localStorage avec React
 * Sauvegarde automatique et restauration lors du chargement
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        console.log(`✅ Données restaurées depuis localStorage: ${key}`)
        return JSON.parse(item)
      }
      console.log(`ℹ️ Pas de données localStorage trouvées pour: ${key}`)
      return initialValue
    } catch (error) {
      console.error(`❌ Erreur lors de la restauration de ${key}:`, error)
      return initialValue
    }
  })

  // Fonction de mise à jour qui sauvegarde aussi dans localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Sauvegarder immédiatement
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      console.log(`💾 Données sauvegardées dans localStorage: ${key}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de ${key}:`, error)
    }
  }

  return [storedValue, setValue]
}
