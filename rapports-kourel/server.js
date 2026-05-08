import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { genererPDFDirectement } from './src/utils/pdfGeneratorService.js'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))

// Log toutes les requêtes
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`)
  next()
})

// ========================================================
// GESTION DES ERREURS GLOBALES
// ========================================================
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON GÉRÉE:', error.message)
  console.error(error.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMISE REJETÉE NON GÉRÉE:', reason)
})

// Endpoint pour générer le PDF directement avec pdfkit
app.post('/api/generate-pdf', async (req, res) => {
  try {
    console.log('🚀 Serveur: Début génération PDF avec pdfkit...')
    
    const { rapport, kourel, programmeAnnuel } = req.body
    
    if (!rapport || !kourel) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données manquantes' 
      })
    }
    
    // Générer le PDF directement
    const pdfBuffer = await genererPDFDirectement(rapport, kourel, programmeAnnuel || [])
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF vide généré')
    }
    
    console.log(`📄 Serveur: PDF généré avec succès (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="Rapport_${kourel.nom.replace(/\s+/g, '_')}_${rapport.mois}_${rapport.annee}.pdf"`)
    res.send(pdfBuffer)
    
    console.log('✅ Serveur: PDF envoyé au client')
    
  } catch (error) {
    console.error('❌ Serveur: Erreur génération PDF:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur inconnue'
    })
  }
})

// Endpoint de TEST pour vérifier que la génération PDF fonctionne
app.get('/api/test-pdf', async (req, res) => {
  try {
    console.log('🧪 TEST: Génération PDF simple...')
    
    // Données de test
    const testRapport = {
      mois: 'Mars',
      annee: 2026,
      date: new Date().toLocaleDateString('fr-FR'),
      melodies: [
        {
          nom: 'Khatimatou',
          type: 'Nouvelle',
          taux: 85,
          statut: 'termine'
        },
        {
          nom: 'Serigne Abdou Diop',
          type: 'Révision',
          taux: 60,
          statut: 'en_cours'
        }
      ],
      programme_annuel_etat: [
        { nom: 'Tafsir Quran', statut: 'termine' },
        { nom: 'Hadith', statut: 'en_cours', pourcentage: 70 },
        { nom: 'Fiqh', statut: 'pas_commence' }
      ],
      objectifs: 'Continuer la progression régulière de la mémorisation et consolider les acquis.',
      ajustements: 'Augmenter la fréquence des séances de révision.',
      appreciation: 'Très bon travail globalement, continuation encouragée.',
      appreciation_details: {
        positifs: 'Assiduité remarquable, engagement constant',
        surveiller: 'La fatigue pendant les révisions',
        retard: 'Aucun retard majeur',
        priorites: 'Consolider les bases avant progression'
      }
    }

    const testKourel = {
      nom: 'Kourel Test',
      responsable: 'Cheikh Responsable'
    }

    const testProgrammeAnnuel = [
      { id: 1, nom: 'Tafsir Quran' },
      { id: 2, nom: 'Hadith' },
      { id: 3, nom: 'Fiqh' }
    ]

    // Générer le PDF
    const pdfBuffer = await genererPDFDirectement(testRapport, testKourel, testProgrammeAnnuel)

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF vide généré')
    }

    console.log(`🎉 TEST: SUCCÈS! PDF généré (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="test-rapport.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message)
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur API rapports-kourel actif' })
})

// Middleware erreur global (après toutes les routes)
app.use((err, req, res, next) => {
  console.error('❌ MIDDLEWARE ERREUR:', err.message)
  res.status(500).json({ success: false, error: err.message || 'Erreur interne' })
})

const PORT = 3001
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur API lancé sur http://localhost:${PORT}`)
  console.log(`📝 POST http://localhost:${PORT}/api/generate-pdf pour générer un PDF`)
  console.log(`🧪 GET  http://localhost:${PORT}/api/test-pdf pour tester`)
})

// Gestion des erreurs d'écoute
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé. Essayez un autre port.`)
    console.error(`   Tuez le processus existant:`)
    console.error(`   Windows: netstat -ano | findstr :${PORT}`)
    console.error(`   Mac/Linux: lsof -i :${PORT}`)
  } else {
    console.error('❌ Erreur serveur:', error.message)
  }
  process.exit(1)
})