// src/utils/pdfService.js

export async function genererPDF(rapport, kourel, programmeAnnuel) {
  try {
    console.log('🚀 Client: Début génération PDF...')
    
    // Appeler le serveur backend local
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rapport,
        kourel,
        programmeAnnuel
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Erreur serveur: ${response.status}`)
    }
    
    console.log('✅ Client: PDF reçu du serveur')
    
    // Récupérer le PDF
    const pdfBlob = await response.blob()
    
    if (pdfBlob.size === 0) {
      throw new Error('PDF vide reçu')
    }
    
    console.log(`📄 Client: PDF reçu (${(pdfBlob.size / 1024).toFixed(2)} KB)`)
    
    // Télécharger le PDF
    const url = window.URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rapport_${kourel.nom.replace(/\s+/g, '_')}_${rapport.mois}_${rapport.annee}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    console.log('✅ Client: PDF téléchargé avec succès')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Client: Erreur génération PDF:', error)
    return { 
      success: false, 
      error: error.message || 'Erreur inconnue'
    }
  }
}