import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import crypto from 'crypto'
import cron from 'node-cron'
import { createClient } from '@supabase/supabase-js'
import { genererPDFDirectement } from './src/utils/pdfGeneratorService.js'

// Client Supabase côté serveur
const supabaseServer = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

async function envoyerWhatsApp(telephone, apikey, message) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(telephone)}&text=${encodeURIComponent(message)}&apikey=${apikey}`
  const res = await fetch(url)
  return res.ok
}

async function envoyerRappelKourels(kourelId = null) {
  let query = supabaseServer.from('kourels').select('*').eq('actif', true).not('telephone', 'is', null).not('callmebot_apikey', 'is', null)
  if (kourelId) query = query.eq('id', kourelId)
  const { data: kourels, error } = await query
  if (error || !kourels?.length) return { envoyes: 0, erreurs: 0 }

  const now = new Date()
  const mois = MOIS_FR[now.getMonth()]
  const annee = now.getFullYear()

  let envoyes = 0, erreurs = 0
  for (const k of kourels) {
    const message = `Assalamu Alaikum ${k.responsable},\n\nRappel : merci de soumettre le rapport mensuel du *${k.nom}* pour *${mois} ${annee}* avant le 5 du mois.\n\nBarakallahu fiikum\n— DMN · Commission Conservatoire`
    const ok = await envoyerWhatsApp(k.telephone, k.callmebot_apikey, message)
    ok ? envoyes++ : erreurs++
  }
  return { envoyes, erreurs }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(join(dirname(fileURLToPath(import.meta.url)), 'dist', 'index.html'))

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))

// En production : servir le frontend Vite buildé
if (isProd) {
  const distPath = join(__dirname, 'dist')
  app.use(express.static(distPath))
}

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

// ── Validation de code d'accès pour évaluation ──────────────────────────────
app.post('/api/valider-code-acces', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ success: false, error: 'Code requis' })

    const { data, error } = await supabaseServer
      .from('eval_membres')
      .select('*, evenement_kourel:evenement_kourel_id(*, evenement:evenement_id(*, type:type_id(id, nom), lieu:lieu_id(id, nom)), kourel:kourel_id(id, nom)), membre:membre_id(*)')
      .eq('code_acces', code.toUpperCase().trim())
      .maybeSingle()

    if (error) throw error
    if (!data) return res.status(404).json({ success: false, error: 'Code invalide' })

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── Générer des codes d'accès pour un (événement × kourel) ────────────────
app.post('/api/generer-codes-evenement', async (req, res) => {
  try {
    const { evenement_id, kourel_id, evaluateurs = [], paginateurs = [] } = req.body
    if (!evenement_id || !kourel_id || (!evaluateurs.length && !paginateurs.length)) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' })
    }

    // 1. Créer/récupérer le lien événement × kourel
    const { data: ek, error: ekError } = await supabaseServer
      .from('evenement_kourels')
      .upsert({ evenement_id, kourel_id }, { onConflict: 'evenement_id,kourel_id' })
      .select()
      .single()
    if (ekError) throw ekError

    const results = []

    // 2. Créer les évaluateurs (avec codes)
    for (const membre_id of evaluateurs) {
      const code = 'EVAL-' + String(evenement_id).padStart(3, '0') + '-' + String(kourel_id).padStart(2, '0') + '-' + String(membre_id).padStart(2, '0')
      const { data, error } = await supabaseServer
        .from('eval_membres')
        .insert({
          evenement_kourel_id: ek.id,
          membre_id,
          role: 'evaluateur',
          code_acces: code,
        })
        .select('*, membre:membre_id(*)')
        .single()
      if (error) { if (error.code !== '23505') throw error; continue }
      results.push(data)
    }

    // 3. Créer les paginateurs (sans code)
    for (const membre_id of paginateurs) {
      const { data, error } = await supabaseServer
        .from('eval_membres')
        .insert({
          evenement_kourel_id: ek.id,
          membre_id,
          role: 'paginateur',
          code_acces: null,
        })
        .select('*, membre:membre_id(*)')
        .single()
      if (error) { if (error.code !== '23505') throw error; continue }
      results.push(data)
    }

    res.json({ success: true, data: results, evenement_kourel: ek })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── Mettre à jour les kourels d'un événement ─────────────────────────────────
app.put('/api/evenements/:id/kourels', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const { kourels } = req.body
    if (!eventId) return res.status(400).json({ success: false, error: 'ID requis' })

    // Supprimer les anciens liens
    await supabaseServer.from('evenement_kourels').delete().eq('evenement_id', eventId)

    // Recréer
    for (const k of (kourels || [])) {
      const { data: ek } = await supabaseServer
        .from('evenement_kourels')
        .insert({ evenement_id: eventId, kourel_id: Number(k.kourel_id) })
        .select()
        .single()
      if (!ek) continue

      const evalIds = k.evaluateurs || []
      const pagIds = k.paginateurs || []
      for (const membre_id of evalIds) {
        const code = 'EVAL-' + String(eventId).padStart(3, '0') + '-' + String(k.kourel_id).padStart(2, '0') + '-' + String(membre_id).padStart(2, '0')
        await supabaseServer.from('eval_membres').insert({
          evenement_kourel_id: ek.id, membre_id, role: 'evaluateur', code_acces: code,
        }).select().single().catch(e => { if (e.code !== '23505') throw e })
      }
      for (const membre_id of pagIds) {
        await supabaseServer.from('eval_membres').insert({
          evenement_kourel_id: ek.id, membre_id, role: 'paginateur', code_acces: null,
        }).select().single().catch(e => { if (e.code !== '23505') throw e })
      }
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── CRUD Membres ────────────────────────────────────────────────────────────
app.get('/api/membres', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('membres').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/membres', async (req, res) => {
  try {
    const { prenom, nom, kourel, telephone, statut } = req.body
    const { data, error } = await supabaseServer.from('membres').insert({ prenom, nom, kourel, telephone, statut: statut || 'actif' }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/membres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('membres').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/membres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('membres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── CRUD Types d'événements ─────────────────────────────────────────────────
app.get('/api/types-evenements', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('types_evenements').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/types-evenements', async (req, res) => {
  try {
    const { nom, description } = req.body
    const { data, error } = await supabaseServer.from('types_evenements').insert({ nom, description }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/types-evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('types_evenements').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/types-evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('types_evenements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── CRUD Lieux ──────────────────────────────────────────────────────────────
app.get('/api/lieux', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('lieux').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/lieux', async (req, res) => {
  try {
    const { nom } = req.body
    const { data, error } = await supabaseServer.from('lieux').insert({ nom }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── CRUD Événements ─────────────────────────────────────────────────────────
app.get('/api/evenements', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('evenements')
      .select('*, type:type_id(id, nom), lieu:lieu_id(id, nom)')
      .order('date', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/evenements', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('evenements').insert(req.body).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenements').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── CRUD Critères ───────────────────────────────────────────────────────────
app.get('/api/criteres', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('criteres').select('*').eq('actif', true).order('ordre')
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/criteres', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('criteres').insert(req.body).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.put('/api/criteres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('criteres').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/criteres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('criteres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── Évaluations ─────────────────────────────────────────────────────────────
app.get('/api/evaluations/evenement/:evenementId', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('evaluations')
      .select('*, membre:membre_id(id, prenom, nom, kourel), notes:evaluation_notes(*)')
      .eq('evenement_id', req.params.evenementId)
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/evaluations/save-note', async (req, res) => {
  try {
    const { evaluation_id, critere_id, appreciation, note, remarques } = req.body
    const { data, error } = await supabaseServer
      .from('evaluation_notes')
      .upsert({
        evaluation_id, critere_id,
        appreciation: appreciation || null,
        note: note != null ? note : null,
        remarques: remarques || null,
      }, { onConflict: 'evaluation_id, critere_id' })
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/evaluations/soumettre', async (req, res) => {
  try {
    const { evaluation_id, commentaire } = req.body
    const { error } = await supabaseServer
      .from('evaluations')
      .update({ soumis: true, commentaire })
      .eq('id', evaluation_id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Middleware erreur global
app.use((err, req, res, next) => {
  console.error('❌ MIDDLEWARE ERREUR:', err.message)
  res.status(500).json({ success: false, error: err.message || 'Erreur interne' })
})

// ── Endpoint envoi rappel WhatsApp ───────────────────────────────────────────
app.post('/api/send-rappel', async (req, res) => {
  try {
    const { kourel_id } = req.body
    const { envoyes, erreurs } = await envoyerRappelKourels(kourel_id || null)
    res.json({
      success: true,
      message: `${envoyes} rappel(s) envoyé(s)${erreurs > 0 ? `, ${erreurs} échec(s)` : ''}.`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── Cron : rappel automatique le 1er de chaque mois à 9h00 ───────────────────
cron.schedule('0 9 1 * *', async () => {
  console.log('📅 Cron: envoi des rappels WhatsApp mensuels...')
  const { envoyes, erreurs } = await envoyerRappelKourels()
  console.log(`✅ Cron: ${envoyes} envoyé(s), ${erreurs} échec(s)`)
}, { timezone: 'Africa/Dakar' })

// En production : toutes les routes non-API renvoient index.html (SPA)
if (isProd) {
  app.get('*path', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`)
  if (!isProd) {
    console.log(`📝 POST http://localhost:${PORT}/api/generate-pdf`)
    console.log(`🧪 GET  http://localhost:${PORT}/api/test-pdf`)
  }
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