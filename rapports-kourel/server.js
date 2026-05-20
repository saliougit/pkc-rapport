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
  process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function genererCodeAcces() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const parts = []
  for (let i = 0; i < 3; i++) {
    let part = ''
    for (let j = 0; j < 4; j++) {
      part += chars[Math.floor(Math.random() * chars.length)]
    }
    parts.push(part)
  }
  return parts.join('-')
}

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
  app.use(express.static(distPath, {
    setHeaders(res, path) {
      if (path.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (path.endsWith('.js') || path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    }
  }))
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

// ── DATA ROUTES (proxy Supabase → Express, connexion persistante) ──────────

// ── Kourels ──────────────────────────────────────────────────────────────────
app.get('/api/data/kourels', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('kourels').select('*').eq('actif', true).order('id')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/kourels', async (req, res) => {
  try {
    const { nom, responsable, effectif_total, effectif_actif } = req.body
    const { data, error } = await supabaseServer.from('kourels').insert({ nom, responsable, effectif_total, effectif_actif }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/kourels/:id', async (req, res) => {
  try {
    const { nom, responsable, telephone, callmebot_apikey, effectif_total, effectif_actif } = req.body
    const { error } = await supabaseServer.from('kourels').update({ nom, responsable, telephone, callmebot_apikey, effectif_total, effectif_actif }).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/kourels/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('kourels').update({ actif: false }).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Programme annuel ─────────────────────────────────────────────────────────
app.get('/api/data/programme/:kourelId', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('programme_annuel').select('*').eq('kourel_id', req.params.kourelId).order('ordre')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/programme', async (req, res) => {
  try {
    const { kourel_id, nom, melodie, ordre } = req.body
    const { data, error } = await supabaseServer.from('programme_annuel').insert({ kourel_id, nom, melodie, ordre }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/programme/:id', async (req, res) => {
  try {
    const { nom, melodie } = req.body
    const { error } = await supabaseServer.from('programme_annuel').update({ nom, melodie }).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/programme/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('programme_annuel').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Membres du comité ────────────────────────────────────────────────────────
app.get('/api/data/membres', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('membres').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/membres', async (req, res) => {
  try {
    const { prenom, nom, kourel, telephone, statut } = req.body
    const { data, error } = await supabaseServer.from('membres').insert({ prenom, nom, kourel, telephone, statut: statut || 'actif' }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/membres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('membres').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/membres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('membres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Types d'événements ───────────────────────────────────────────────────────
app.get('/api/data/types-evenements', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('types_evenements').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/types-evenements', async (req, res) => {
  try {
    const { nom, description } = req.body
    const { data, error } = await supabaseServer.from('types_evenements').insert({ nom, description }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/types-evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('types_evenements').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/types-evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('types_evenements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Lieux ────────────────────────────────────────────────────────────────────
app.get('/api/data/lieux', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('lieux').select('*').order('id')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/lieux', async (req, res) => {
  try {
    const { nom } = req.body
    const { data, error } = await supabaseServer.from('lieux').insert({ nom }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Critères d'évaluation ────────────────────────────────────────────────────
app.get('/api/data/criteres', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('criteres').select('*').eq('actif', true).order('ordre')
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/criteres', async (req, res) => {
  try {
    const { section_nom, description } = req.body
    const { data, error } = await supabaseServer.from('criteres').insert({ section_nom, description }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/criteres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('criteres').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/criteres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('criteres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Événements (avec enrichissement kourels/evaluateurs) ──────────────────────
app.get('/api/data/evenements', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('evenements')
      .select('*, type:type_id(id, nom), lieu:lieu_id(id, nom), kourels:evenement_kourels(id, note_definitive, conclusion, kourel:kourel_id(id, nom), eval_membres:eval_membres(id, membre_id, role, code_acces))')
      .order('date_evenement', { ascending: false })
    if (error) throw error
    const enriched = (data || []).map(ev => {
      const allEvalIds = []
      const kourels = (ev.kourels || []).map(ek => {
        const evaluateurs = (ek.eval_membres || []).filter(em => em.role === 'evaluateur').map(em => em.membre_id)
        const paginateurs = (ek.eval_membres || []).filter(em => em.role === 'paginateur').map(em => em.membre_id)
        const codes = (ek.eval_membres || []).filter(em => em.code_acces).reduce((acc, em) => ({ ...acc, [em.membre_id]: em.code_acces }), {})
        allEvalIds.push(...evaluateurs)
        return { ...ek, evaluateurs, paginateurs, codes }
      })
      return { ...ev, kourels, evaluateurs: allEvalIds }
    })
    res.json({ success: true, data: enriched })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/evenements', async (req, res) => {
  try {
    const { type_id, date_evenement, lieu_id, statut } = req.body
    const { data, error } = await supabaseServer.from('evenements').insert({ type_id, date_evenement, lieu_id, statut }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenements').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/evenements/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Événement ↔ Kourels ──────────────────────────────────────────────────────
app.post('/api/data/evenement-kourels', async (req, res) => {
  try {
    const { evenement_id, kourel_id } = req.body
    const { data, error } = await supabaseServer.from('evenement_kourels').insert({ evenement_id, kourel_id }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/evenements/:eventId/kourels', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenement_kourels').delete().eq('evenement_id', req.params.eventId)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/evenement-kourels/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('evenement_kourels').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Eval Membres (évaluateurs/paginateurs) ───────────────────────────────────
app.get('/api/data/eval-membres/:evenementId', async (req, res) => {
  try {
    const { data: ekList, error: ekError } = await supabaseServer.from('evenement_kourels').select('id').eq('evenement_id', req.params.evenementId)
    if (ekError) throw ekError
    const ids = (ekList || []).map(ek => ek.id)
    if (!ids.length) return res.json({ success: true, data: [] })
    const { data, error } = await supabaseServer.from('eval_membres').select('*, evenement_kourel:evenement_kourel_id(id, kourel:kourel_id(id, nom)), membre:membre_id(id, prenom, nom, kourel)').in('evenement_kourel_id', ids)
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/eval-membres', async (req, res) => {
  try {
    const { evenement_kourel_id, membre_id, role, code_acces } = req.body
    const { data, error } = await supabaseServer.from('eval_membres').insert({ evenement_kourel_id, membre_id, role, code_acces }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.delete('/api/data/eval-membres/:id', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('eval_membres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Évaluations ──────────────────────────────────────────────────────────────
app.get('/api/data/evaluations/:evenementId', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('evaluations').select('*, membre:membre_id(id, prenom, nom, kourel), notes:evaluation_notes(*)').eq('evenement_id', req.params.evenementId)
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.get('/api/data/evaluations/get-or-create/:evenementId/:membreId', async (req, res) => {
  try {
    const { evenementId, membreId } = req.params
    const { data: existing } = await supabaseServer.from('evaluations').select('*, notes:evaluation_notes(*)').eq('evenement_id', evenementId).eq('membre_id', membreId).maybeSingle()
    if (existing) return res.json({ success: true, data: existing })
    const { data, error } = await supabaseServer.from('evaluations').insert({ evenement_id: Number(evenementId), membre_id: Number(membreId) }).select('*, notes:evaluation_notes(*)').single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/evaluation-notes', async (req, res) => {
  try {
    const { evaluation_id, critere_id, appreciation, note, remarques, nombre_present } = req.body
    const { data, error } = await supabaseServer.from('evaluation_notes').upsert({
      evaluation_id, critere_id,
      appreciation: appreciation || null,
      note: note != null ? note : null,
      remarques: remarques || null,
      nombre_present: nombre_present != null ? nombre_present : null,
    }, { onConflict: 'evaluation_id,critere_id' }).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.post('/api/data/evaluations/soumettre', async (req, res) => {
  try {
    const { evaluation_id, commentaire } = req.body
    const { error } = await supabaseServer.from('evaluations').update({ soumis: true, commentaire }).eq('id', evaluation_id)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Profils ───────────────────────────────────────────────────────────────────
app.get('/api/data/profiles/:userId', async (req, res) => {
  try {
    const { data, error } = await supabaseServer.from('profiles').select('*').eq('id', req.params.userId).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

app.put('/api/data/profiles/:userId', async (req, res) => {
  try {
    const { error } = await supabaseServer.from('profiles').update(req.body).eq('id', req.params.userId)
    if (error) throw error
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// ── Validation de code d'accès pour évaluation ──────────────────────────────
app.post('/api/valider-code-acces', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ success: false, error: 'Code requis' })

    const { data, error } = await supabaseServer
      .from('eval_membres')
      .select('*, evenement_kourel:evenement_kourel_id(*, evenement:evenement_id(*, type:type_id(id, nom), lieu:lieu_id(id, nom)), kourel:kourel_id(id, nom, effectif_actif)), membre:membre_id(*)')
      .eq('code_acces', code.toUpperCase().trim())
      .maybeSingle()

    if (error) { console.error('❌ Supabase error:', error.message); throw error }
    if (!data) { console.log('⚠️ Code not found:', code); return res.status(404).json({ success: false, error: 'Code invalide' }) }

    console.log('✅ Code valide, membre:', data.membre?.prenom, data.membre?.nom)
    res.json({ success: true, data })
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

const PORT = process.env.PORT || 3002
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