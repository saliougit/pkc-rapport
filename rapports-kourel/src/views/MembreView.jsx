import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Plus, Trash2, Edit2, Loader, Check, Users } from 'lucide-react'
import { FormulaireRapport } from '../components/FormulaireRapport'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  fetchKourels, fetchProgramme,
  ajouterKhassida, modifierKhassida, supprimerKhassida,
  fetchProgrammes, creerProgramme, activerProgramme
} from '../lib/supabase'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function initiales(nom = '') {
  return nom.trim().split(/\s+/).slice(0, 2).map(m => m[0]).join('').toUpperCase()
}

export default function MembreView() {
  const [etape, setEtape] = useState('accueil')
  const [sousEtape, setSousEtape] = useState(1)

  const [kourels, setKourels] = useState([])
  const [loadingKourels, setLoadingKourels] = useState(true)

  const [kourelSelectionne, setKourelSelectionne] = useLocalStorage('kourel_selectionne', null)
  const [autreKourel, setAutreKourel] = useLocalStorage('kourel_autre', { nom: '', responsable: '' })

  const [programmeAnnuel, setProgrammeAnnuel] = useState([])
  const [loadingProgramme, setLoadingProgramme] = useState(false)

  useEffect(() => {
    fetchKourels()
      .then(setKourels)
      .catch(() => setKourels([]))
      .finally(() => setLoadingKourels(false))
  }, [])

  useEffect(() => {
    if (!kourelSelectionne || kourelSelectionne === 'autre') {
      setProgrammeAnnuel([])
      return
    }
    setLoadingProgramme(true)
    fetchProgramme(kourelSelectionne)
      .then(setProgrammeAnnuel)
      .catch(() => setProgrammeAnnuel([]))
      .finally(() => setLoadingProgramme(false))
  }, [kourelSelectionne])

  const [rapport, setRapport] = useLocalStorage('rapport_actuel', {
    mois: '',
    annee: new Date().getFullYear(),
    date_rapport: new Date().toISOString().split('T')[0],
    representant: '',
    melodies: [],
    programme_annuel_etat: [],
    programme_annuel_textes: {
      objectifs_atteints: '',
      objectifs_en_cours: '',
      objectifs_non_atteints: '',
      ajustements: ''
    },
    appreciation: {
      generale: '',
      points_positifs: '',
      a_surveiller: '',
      en_retard: '',
      priorites: ''
    }
  })

  const getKourelActuel = () => {
    if (kourelSelectionne === 'autre') return autreKourel
    return kourels.find(k => k.id === kourelSelectionne)
  }

  const calculTaux = (mode, data) => {
    if (mode === 'pages') {
      return Math.round((data.pages_faites / data.pages_total) * 100)
    } else if (mode === 'bayit') {
      return Math.round((data.bayit_faits / data.bayit_total) * 100)
    } else {
      return Math.round((data.dadj_completes.length / data.dadj_total) * 100)
    }
  }

  const calculStatut = (taux) => {
    if (taux >= 80) return { label: 'Bon avancement', color: 'vert' }
    if (taux >= 50) return { label: 'À suivre', color: 'orange' }
    return { label: 'Retard', color: 'rouge' }
  }

  const calculStatsProgamme = () => {
    const getEtatK = (id) => rapport.programme_annuel_etat.find(e => e.khassida_id === id)
    const termines = programmeAnnuel.filter(k => getEtatK(k.id)?.statut === 'termine').length
    const enCours = programmeAnnuel.filter(k => getEtatK(k.id)?.statut === 'en_cours').length
    const pasCommences = programmeAnnuel.filter(k => {
      const e = getEtatK(k.id)
      return !e || e.statut === 'pas_commence'
    }).length
    let somme = termines * 100
    programmeAnnuel.forEach(k => {
      const e = getEtatK(k.id)
      if (e?.statut === 'en_cours') somme += e.pourcentage || 0
    })
    const tauxGlobal = programmeAnnuel.length > 0 ? Math.round(somme / programmeAnnuel.length) : 0
    return { termines, enCours, pasCommences, tauxGlobal, total: programmeAnnuel.length }
  }

  if (etape === 'config_programme') {
    return (
      <ConfigProgrammeAnnuel
        kourel={getKourelActuel()}
        kourelId={kourelSelectionne}
        programmeAnnuel={programmeAnnuel}
        setProgrammeAnnuel={setProgrammeAnnuel}
        retour={() => setEtape('accueil')}
      />
    )
  }

  if (etape === 'rapport') {
    return (
      <FormulaireRapport
        kourel={getKourelActuel()}
        programmeAnnuel={programmeAnnuel}
        rapport={rapport}
        setRapport={setRapport}
        sousEtape={sousEtape}
        setSousEtape={setSousEtape}
        retour={() => setEtape('accueil')}
        calculTaux={calculTaux}
        calculStatut={calculStatut}
        calculStatsProgamme={calculStatsProgamme}
      />
    )
  }

  // === ACCUEIL ===
  return (
    <div className="relative min-h-screen overflow-hidden bg-gris-clair flex flex-col lg:items-center lg:justify-center px-0 lg:px-4 py-0 lg:py-6">
      <motion.div
        className="relative w-full flex-1 flex flex-col lg:flex-none lg:max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header sobre, sans le bandeau vert plein écran */}
        <motion.div
          variants={itemVariants}
          className="relative flex items-center gap-3 px-4 pt-5 pb-4 lg:pt-5 lg:px-6 lg:rounded-t-[2rem]"
          style={{ background: 'linear-gradient(135deg, #EEF8F3 0%, #F5F3EE 100%)' }}
        >
          <Link
            to="/"
            aria-label="Retour à l'accueil"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gris-500 hover:text-vert-700 hover:bg-white/60 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={19} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base text-gris-950 leading-tight">Rapport de Suivi</p>
            <p className="text-xs text-gris-500 leading-tight">Étape 1 · Choix du kourel</p>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div
          variants={itemVariants}
          className="bg-white lg:shadow-xl lg:rounded-b-[2rem] px-4 pt-5 pb-28 lg:p-6 lg:pb-6 flex-1 flex flex-col"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-gris-400 mb-3">
            Sélectionnez votre kourel
          </p>

          {loadingKourels ? (
            <div className="space-y-2 overflow-y-auto flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gris-50 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gris-200 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 bg-gris-200 rounded w-3/4 mb-1.5" />
                    <div className="h-2.5 bg-gris-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
              {kourels.map(kourel => {
                const selected = kourelSelectionne === kourel.id
                return (
                  <label key={kourel.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors"
                    style={{ background: selected ? '#EEF8F3' : '#F8FAF9' }}>
                    <input type="radio" name="kourel" value={kourel.id}
                      checked={selected}
                      onChange={() => setKourelSelectionne(kourel.id)}
                      className="sr-only" />
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors"
                      style={{ background: selected ? '#016A3B' : '#E5EAE7', color: selected ? 'white' : '#6B7A71' }}>
                      {selected ? <Check size={16} /> : initiales(kourel.nom)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate text-gris-950">{kourel.nom}</div>
                      <div className="text-xs text-gris-500 truncate">{kourel.responsable}</div>
                    </div>
                  </label>
                )
              })}

              <label className="flex items-start gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors"
                style={{ background: kourelSelectionne === 'autre' ? '#EEF8F3' : '#F8FAF9' }}>
                <input type="radio" name="kourel" value="autre"
                  checked={kourelSelectionne === 'autre'}
                  onChange={() => setKourelSelectionne('autre')}
                  className="sr-only" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: kourelSelectionne === 'autre' ? '#016A3B' : '#E5EAE7', color: kourelSelectionne === 'autre' ? 'white' : '#6B7A71' }}>
                  {kourelSelectionne === 'autre' ? <Check size={16} /> : <Users size={16} />}
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="text-sm font-semibold text-gris-950">Autre kourel</div>
                  {kourelSelectionne === 'autre' && (
                    <div className="space-y-1.5 mt-2">
                      <input type="text" placeholder="Nom du kourel" value={autreKourel.nom}
                        onChange={(e) => setAutreKourel({ ...autreKourel, nom: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gris-200 rounded-xl text-sm focus:outline-none focus:border-vert-principal" />
                      <input type="text" placeholder="Responsable" value={autreKourel.responsable}
                        onChange={(e) => setAutreKourel({ ...autreKourel, responsable: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gris-200 rounded-xl text-sm focus:outline-none focus:border-vert-principal" />
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Actions : barre fixe en bas sur mobile, inline sous la carte sur desktop */}
      <div
        className="fixed bottom-0 inset-x-0 lg:static lg:mt-4 lg:w-full lg:max-w-xl bg-white lg:bg-transparent shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:shadow-none px-4 py-3 lg:px-0 lg:py-0 flex gap-2.5 z-20"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setEtape('config_programme')}
          disabled={!kourelSelectionne || kourelSelectionne === 'autre' || loadingProgramme}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-semibold text-xs whitespace-nowrap text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ background: '#34495E' }}
        >
          <Edit2 size={13} />
          Programme Annuel
        </button>
        <button
          onClick={() => { setEtape('rapport'); setSousEtape(1) }}
          disabled={!kourelSelectionne || loadingProgramme}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-semibold text-xs whitespace-nowrap text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ background: '#16824E' }}
        >
          {loadingProgramme
            ? <Loader size={13} className="animate-spin" />
            : <ChevronRight size={13} />}
          {loadingProgramme ? 'Chargement...' : 'Créer un Rapport'}
        </button>
      </div>
    </div>
  )
}

// ─── Configuration Programme Annuel ──────────────────────────────────────────

function ConfigProgrammeAnnuel({ kourel, kourelId, programmeAnnuel, setProgrammeAnnuel, retour }) {
  const [enEdition, setEnEdition] = useState(null)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '', pages_total: '', bayit_total: '' })
  const [saving, setSaving] = useState(false)

  const [programmes, setProgrammes] = useState([])
  const [changingVersion, setChangingVersion] = useState(false)

  useEffect(() => {
    fetchProgrammes(kourelId).then(setProgrammes).catch(() => setProgrammes([]))
  }, [kourelId])

  const programmeActif = programmes.find(p => p.actif)

  const changerVersion = async (programmeId) => {
    setChangingVersion(true)
    try {
      await activerProgramme(programmeId)
      const [progs, khassidas] = await Promise.all([
        fetchProgrammes(kourelId),
        fetchProgramme(kourelId),
      ])
      setProgrammes(progs)
      setProgrammeAnnuel(khassidas)
    } finally {
      setChangingVersion(false)
    }
  }

  const nouvelleVersion = async () => {
    const nom = window.prompt('Nom de la nouvelle version (ex: 2026-2027)')
    if (!nom?.trim()) return
    setChangingVersion(true)
    try {
      await creerProgramme(kourelId, nom.trim())
      const [progs, khassidas] = await Promise.all([
        fetchProgrammes(kourelId),
        fetchProgramme(kourelId),
      ])
      setProgrammes(progs)
      setProgrammeAnnuel(khassidas)
    } finally {
      setChangingVersion(false)
    }
  }

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.melodie) return
    setSaving(true)
    try {
      const pagesTotal = nouveau.pages_total === '' ? null : parseInt(nouveau.pages_total)
      const bayitTotal = nouveau.bayit_total === '' ? null : parseInt(nouveau.bayit_total)
      const k = await ajouterKhassida(kourelId, nouveau.nom, nouveau.melodie, programmeAnnuel.length, pagesTotal, bayitTotal)
      setProgrammeAnnuel([...programmeAnnuel, k])
      setNouveau({ nom: '', melodie: '', pages_total: '', bayit_total: '' })
    } finally {
      setSaving(false)
    }
  }

  const supprimer = async (id) => {
    await supprimerKhassida(id)
    setProgrammeAnnuel(programmeAnnuel.filter(k => k.id !== id))
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      const pagesTotal = k.pages_total === '' || k.pages_total == null ? null : parseInt(k.pages_total)
      const bayitTotal = k.bayit_total === '' || k.bayit_total == null ? null : parseInt(k.bayit_total)
      await modifierKhassida(k.id, k.nom, k.melodie, pagesTotal, bayitTotal)
      setProgrammeAnnuel(programmeAnnuel.map(p => p.id === k.id ? { ...k, pages_total: pagesTotal, bayit_total: bayitTotal } : p))
      setEnEdition(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-5 py-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#014421' }}>
            <Edit2 size={15} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#014421' }}>Programme Annuel</p>
            <p className="text-xs text-gray-400 truncate">{kourel?.nom} · {kourel?.responsable}</p>
          </div>
          <button onClick={retour}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-vert-fonce transition py-1.5 px-3 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={16} /> Retour
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-5 py-3 mb-4">
          <span className="text-xs font-semibold text-gray-400 flex-shrink-0">Version</span>
          <select
            value={programmeActif?.id || ''}
            onChange={(e) => changerVersion(Number(e.target.value))}
            disabled={changingVersion || programmes.length === 0}
            className="flex-1 min-w-0 text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal disabled:opacity-50"
            style={{ color: '#014421' }}
          >
            {programmes.map(p => (
              <option key={p.id} value={p.id}>{p.nom}{p.actif ? ' (en vigueur)' : ''}</option>
            ))}
          </select>
          <button onClick={nouvelleVersion} disabled={changingVersion}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50 hover:opacity-90 transition flex-shrink-0"
            style={{ background: '#16824E' }}>
            <Plus size={13} /> Nouvelle version
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm self-start w-full">
            <h3 className="text-xs sm:text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: '#014421' }}>
              <Plus size={15} /> Nouveau khassida
            </h3>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <input type="text" placeholder="Nom du khassida" value={nouveau.nom}
                onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
              <input type="text" placeholder="Mélodie (ex: Serigne Abdou Diop)" value={nouveau.melodie}
                onChange={(e) => setNouveau({ ...nouveau, melodie: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
              <input type="number" min="1" placeholder="Nombre de pages (optionnel)" value={nouveau.pages_total}
                onChange={(e) => setNouveau({ ...nouveau, pages_total: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
              <input type="number" min="1" placeholder="Nombre de bayit (optionnel)" value={nouveau.bayit_total}
                onChange={(e) => setNouveau({ ...nouveau, bayit_total: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
            </div>
            <button onClick={ajouter} disabled={!nouveau.nom || !nouveau.melodie || saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition"
              style={{ background: '#16824E' }}>
              <Plus size={15} /> {saving ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#014421' }}>
              Khassidas ({programmeAnnuel.length})
            </h3>
            {programmeAnnuel.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">Aucun khassida. Ajoutez-en un ci-contre.</div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
                {programmeAnnuel.map((k, index) => (
                  <div key={k.id} className="border border-gray-100 rounded-lg p-3 hover:border-vert-principal transition">
                    {enEdition?.id === k.id ? (
                      <div className="space-y-2">
                        <input type="text" value={enEdition.nom}
                          onChange={(e) => setEnEdition({ ...enEdition, nom: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <input type="text" value={enEdition.melodie}
                          onChange={(e) => setEnEdition({ ...enEdition, melodie: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <input type="number" min="1" placeholder="Nombre de pages (optionnel)" value={enEdition.pages_total ?? ''}
                          onChange={(e) => setEnEdition({ ...enEdition, pages_total: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <input type="number" min="1" placeholder="Nombre de bayit (optionnel)" value={enEdition.bayit_total ?? ''}
                          onChange={(e) => setEnEdition({ ...enEdition, bayit_total: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <div className="flex gap-2">
                          <button onClick={() => sauvegarderEdition(enEdition)}
                            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                            style={{ background: '#16824E' }}>
                            {saving ? 'Enregistrement...' : 'Sauvegarder'}
                          </button>
                          <button onClick={() => setEnEdition(null)}
                            className="text-xs font-semibold text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: '#014421' }}>{index + 1}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: '#014421' }}>{k.nom}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {k.melodie}{k.pages_total ? ` · ${k.pages_total} pages` : ''}{k.bayit_total ? ` · ${k.bayit_total} bayit` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEnEdition({ ...k })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 transition" style={{ color: '#34495E' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => supprimer(k.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#C0392B' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
