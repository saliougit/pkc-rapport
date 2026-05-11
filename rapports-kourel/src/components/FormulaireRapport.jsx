import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, Pencil, Download, User, Music, CalendarDays, Star, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { genererPDF } from '../utils/pdfService'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

// ─── SHELL PRINCIPAL ──────────────────────────────────────────────────────────
// Stepper fixe en haut, boutons fixes en bas, seul le contenu change.
export function FormulaireRapport({
  kourel, programmeAnnuel, rapport, setRapport,
  sousEtape, setSousEtape, retour,
  calculTaux, calculStatut, calculStatsProgamme
}) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [succes, setSucces] = useState(false)
  const [error, setError] = useState(null)

  const genererPDFClick = async () => {
    setLoading(true)
    setSucces(false)
    setError(null)
    setProgress(0)
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99
        const inc = prev < 20 ? 5 : prev < 45 ? 2.5 : prev < 80 ? 0.8 : 0.15
        return Math.min(99, Math.round((prev + inc) * 10) / 10)
      })
    }, 250)
    const result = await genererPDF(rapport, kourel, programmeAnnuel)
    clearInterval(timer)
    if (result.success) {
      setProgress(100)
      setSucces(true)
      setTimeout(() => { setLoading(false); setProgress(0); setSucces(false) }, 1500)
    } else {
      setLoading(false)
      setProgress(0)
      setError(result.error)
    }
  }

  const peutSuivre = sousEtape === 1 ? !!rapport.mois : true

  return (
    <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-2 sm:px-4 py-2 sm:py-4">
      {loading && <LoadingModal progress={Math.round(progress)} succes={succes} />}

      <div
        className="w-full max-w-5xl flex flex-col rounded-2xl shadow-xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 1rem)' }}
      >
        {/* ── STEPPER — toujours au même endroit ── */}
        <div className="bg-white px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-2 sm:pb-3 flex-shrink-0 border-b border-gray-100">
          <Stepper etape={sousEtape} />
        </div>

        {/* ── CONTENU — seule zone qui change ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
          {sousEtape === 1 && (
            <Step1Identification kourel={kourel} rapport={rapport} setRapport={setRapport} />
          )}
          {sousEtape === 2 && (
            <Step2Melodies
              rapport={rapport} setRapport={setRapport}
              programmeAnnuel={programmeAnnuel}
              calculTaux={calculTaux} calculStatut={calculStatut}
            />
          )}
          {sousEtape === 3 && (
            <Step3Programme
              rapport={rapport} setRapport={setRapport}
              programmeAnnuel={programmeAnnuel}
              calculStatsProgamme={calculStatsProgamme}
            />
          )}
          {sousEtape === 4 && (
            <Step4Appreciation
              rapport={rapport} setRapport={setRapport}
              kourel={kourel} programmeAnnuel={programmeAnnuel}
            />
          )}
          {error && (
            <div className="mt-3 bg-rouge-pastel border border-rouge-alerte rounded-xl p-3 text-sm text-rouge-alerte">
              <strong>Erreur :</strong> {error}
            </div>
          )}
        </div>

        {/* ── NAVIGATION — toujours au même endroit ── */}
        <div className="bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex-shrink-0 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <button
            onClick={sousEtape === 1 ? retour : () => setSousEtape(sousEtape - 1)}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gray-500 hover:opacity-90 transition"
          >
            <ChevronLeft size={14} className="sm:hidden" />
            <ChevronLeft size={16} className="hidden sm:block" />
            <span>{sousEtape === 1 ? 'Retour' : 'Précédent'}</span>
          </button>

          {sousEtape === 4 ? (
            <button
              onClick={genererPDFClick}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-vert-principal hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Download size={14} className="sm:hidden" />
              <Download size={16} className="hidden sm:block" />
              <span>Télécharger le PDF</span>
            </button>
          ) : (
            <button
              onClick={() => setSousEtape(sousEtape + 1)}
              disabled={!peutSuivre}
              className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-vert-principal hover:opacity-90 disabled:opacity-40 transition"
            >
              <span>Suivant</span>
              <ChevronRight size={14} className="sm:hidden" />
              <ChevronRight size={16} className="hidden sm:block" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 1 : Identification ──────────────────────────────────────────────────
function Step1Identification({ kourel, rapport, setRapport }) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 sm:mb-1.5 uppercase tracking-wide">Kourel</label>
          <input type="text" value={kourel.nom} disabled
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 sm:mb-1.5 uppercase tracking-wide">Responsable</label>
          <input type="text" value={kourel.responsable} disabled
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mois</label>
          <select value={rapport.mois} onChange={(e) => setRapport({ ...rapport, mois: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none">
            <option value="">Sélectionner...</option>
            {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Année</label>
          <input type="number" value={rapport.annee}
            onChange={(e) => setRapport({ ...rapport, annee: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Date rapport</label>
          <input type="date" value={rapport.date_rapport}
            onChange={(e) => setRapport({ ...rapport, date_rapport: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
          Représentant <span className="normal-case font-normal">(optionnel)</span>
        </label>
        <input type="text" value={rapport.representant}
          onChange={(e) => setRapport({ ...rapport, representant: e.target.value })}
          placeholder="Laisser vide si identique au responsable"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
      </div>
    </div>
  )
}

// ─── STEP 2 : Mélodies ───────────────────────────────────────────────────────
const MEL_VIDE = {
  source: 'programme', khassida_id: null, nom: '', melodie: '',
  type: 'nouvelle', mode: 'pages', pages_faites: 0, pages_total: 1,
  dadj_completes: [0], dadj_total: 1, taux_maitrise: 0
}

function FormMelodie({ mel, setMel, programmeAnnuel, onConfirm, onCancel, titre, labelConfirm }) {
  const selKhassida = (khassidaId) => {
    const k = programmeAnnuel.find(k => k.id === parseInt(khassidaId))
    if (k) setMel({ ...mel, khassida_id: k.id, nom: k.nom, melodie: k.melodie })
  }
  const toggleDadj = (i) => {
    const d = mel.dadj_completes
    setMel({ ...mel, dadj_completes: d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort((a, b) => a - b) })
  }
  return (
    <div className="bg-white rounded-xl p-5 mb-4 shadow-sm" style={{ border: '1.5px solid #16824E' }}>
      <p className="text-sm font-bold mb-4" style={{ color: '#014421' }}>{titre}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Source</label>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button onClick={() => setMel({ ...mel, source: 'programme', nom: '', melodie: '', khassida_id: null })}
              className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
                mel.source === 'programme' ? 'bg-bleu-info text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}>
              Programme
            </button>
            <button onClick={() => setMel({ ...mel, source: 'autre', nom: '', melodie: '', khassida_id: null })}
              className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
                mel.source === 'autre' ? 'bg-bleu-info text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}>
              Autre
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Type</label>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button onClick={() => setMel({ ...mel, type: 'nouvelle' })}
              className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
                mel.type === 'nouvelle' ? 'bg-vert-principal text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}>
              Nouvelle
            </button>
            <button onClick={() => setMel({ ...mel, type: 'revision' })}
              className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
                mel.type === 'revision' ? 'bg-vert-principal text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}>
              Révision
            </button>
          </div>
        </div>
      </div>

      {mel.source === 'programme' && (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Khassida</label>
          <select value={mel.khassida_id || ''} onChange={(e) => selKhassida(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none">
            <option value="">-- Choisir --</option>
            {programmeAnnuel.map(k => <option key={k.id} value={k.id}>{k.nom} ({k.melodie})</option>)}
          </select>
        </div>
      )}

      {mel.source === 'autre' && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Nom</label>
            <input type="text" value={mel.nom} onChange={(e) => setMel({ ...mel, nom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mélodie</label>
            <input type="text" value={mel.melodie} onChange={(e) => setMel({ ...mel, melodie: e.target.value })}
              placeholder="Ex: Serigne Abdou Diop"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Évaluation</label>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button onClick={() => setMel({ ...mel, mode: 'pages' })}
            className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
              mel.mode === 'pages' ? 'bg-orange-strat text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}>
            Par pages
          </button>
          <button onClick={() => setMel({ ...mel, mode: 'dadj' })}
            className={`py-1.5 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
              mel.mode === 'dadj' ? 'bg-orange-strat text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}>
            Par Dadj
          </button>
        </div>
      </div>

      {mel.mode === 'pages' && (
        <div className="bg-vert-pastel rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-vert-fonce mb-1">Pages faites</label>
              <input type="number" min="0" value={mel.pages_faites}
                onChange={(e) => setMel({ ...mel, pages_faites: parseInt(e.target.value) || 0 })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-vert-principal rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-vert-fonce mb-1">Total pages</label>
              <input type="number" min="1" value={mel.pages_total}
                onChange={(e) => setMel({ ...mel, pages_total: parseInt(e.target.value) || 1 })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-vert-principal rounded-lg" />
            </div>
            <div className="text-center text-xl sm:text-2xl font-bold text-vert-principal">
              {Math.round((mel.pages_faites / mel.pages_total) * 100)}%
            </div>
          </div>
        </div>
      )}

      {mel.mode === 'dadj' && (
        <div className="bg-vert-pastel rounded-lg p-3 mb-3">
          <label className="block text-xs font-semibold text-vert-fonce mb-2">Dadj complétés</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Array.from({ length: mel.dadj_total }, (_, i) => (
              <button
                key={i}
                onClick={() => toggleDadj(i)}
                className={`py-1 px-2.5 rounded text-xs font-semibold transition-all duration-200 ${
                  mel.dadj_completes.includes(i)
                    ? 'bg-vert-principal text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-vert-principal'
                }`}
              >
                {i + 1}{i === 0 ? 'er' : 'ème'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setMel({ ...mel, dadj_total: mel.dadj_total + 1 })}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
              style={{ background: '#16824E' }}>
              <Plus size={12} /> Ajouter un Dadj
            </button>
            <span className="text-xl font-bold text-vert-principal">
              {Math.round((mel.dadj_completes.length / mel.dadj_total) * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Taux de maîtrise</label>
        <input type="number" min="0" max="100" value={mel.taux_maitrise}
          onChange={(e) => setMel({ ...mel, taux_maitrise: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
        <p className="text-xs text-gray-400 mt-1">Indiquer le pourcentage de maîtrise de cette mélodie (0-100%)</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={!mel.nom || !mel.melodie}
          className="flex-1 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition"
          style={{ background: '#16824E' }}>
          {labelConfirm}
        </button>
      </div>
    </div>
  )
}

function Step2Melodies({ rapport, setRapport, programmeAnnuel, calculTaux, calculStatut }) {
  const [mel, setMel] = useState({ ...MEL_VIDE })
  const [enAjout, setEnAjout] = useState(false)
  const [enEditionId, setEnEditionId] = useState(null)
  const [melEdition, setMelEdition] = useState(null)

  const resetMel = () => setMel({ ...MEL_VIDE })

  const calculerTauxEtStatut = (m) => {
    const taux = m.mode === 'pages'
      ? Math.round((m.pages_faites / m.pages_total) * 100)
      : Math.round((m.dadj_completes.length / m.dadj_total) * 100)
    return { taux, statut: calculStatut(taux) }
  }

  const ajouter = () => {
    if (!mel.nom || !mel.melodie) return
    const { taux, statut } = calculerTauxEtStatut(mel)
    setRapport({ ...rapport, melodies: [...rapport.melodies, { ...mel, id: Date.now(), taux, statut }] })
    resetMel()
    setEnAjout(false)
  }

  const ouvrirEdition = (m) => {
    setEnEditionId(m.id)
    setMelEdition({ ...m })
    setEnAjout(false)
  }

  const sauvegarderEdition = () => {
    if (!melEdition.nom || !melEdition.melodie) return
    const { taux, statut } = calculerTauxEtStatut(melEdition)
    setRapport({
      ...rapport,
      melodies: rapport.melodies.map(m =>
        m.id === enEditionId ? { ...melEdition, taux, statut } : m
      )
    })
    setEnEditionId(null)
    setMelEdition(null)
  }

  const annulerEdition = () => { setEnEditionId(null); setMelEdition(null) }

  const supprimer = (id) => setRapport({ ...rapport, melodies: rapport.melodies.filter(m => m.id !== id) })

  return (
    <div>
      {!enAjout && enEditionId === null && (
        <button onClick={() => setEnAjout(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-vert-principal hover:opacity-90 transition mb-4">
          <Plus size={15} /> Ajouter une mélodie
        </button>
      )}

      {enAjout && (
        <div className="max-h-96 overflow-y-auto mb-4 pr-2">
          <FormMelodie
            mel={mel} setMel={setMel}
            programmeAnnuel={programmeAnnuel}
            onConfirm={ajouter}
            onCancel={() => { setEnAjout(false); resetMel() }}
            titre="Nouvelle mélodie"
            labelConfirm="Ajouter"
          />
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#014421' }}>
          Mélodies ajoutées ({rapport.melodies.length})
        </p>
        {rapport.melodies.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucune mélodie. Cliquez sur "Ajouter une mélodie" ci-dessus.
          </p>
        ) : (
          <div className="space-y-2">
            {rapport.melodies.map((m) => {
              if (enEditionId === m.id && melEdition) {
                return (
                  <div key={m.id}>
                    <FormMelodie
                      mel={melEdition} setMel={setMelEdition}
                      programmeAnnuel={programmeAnnuel}
                      onConfirm={sauvegarderEdition}
                      onCancel={annulerEdition}
                      titre={`Modifier — ${m.nom}`}
                      labelConfirm="Enregistrer"
                    />
                  </div>
                )
              }
              return (
                <div key={m.id} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-gray-900 truncate">{m.nom}</span>
                      {m.type === 'revision' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0 font-semibold">Révision</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 pb-2 border-b border-gray-200">{m.melodie}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600">Réalisation</span>
                          <span className="text-xs font-bold text-gray-700">{m.taux}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-rouge-alerte to-orange-strat transition-all duration-300" style={{ width: `${m.taux}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{m.mode === 'pages' ? `${m.pages_faites}/${m.pages_total} pages` : `${m.dadj_completes.length}/${m.dadj_total} Dadj`}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Maîtrise:</span>
                        <span className="text-base font-bold text-vert-principal">{m.taux_maitrise || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => ouvrirEdition(m)}
                      className="p-2 rounded-lg hover:bg-white transition text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-300">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => supprimer(m.id)}
                      className="p-2 rounded-lg hover:bg-white transition text-gray-400 hover:text-red-500 border border-transparent hover:border-red-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STEP 3 : Programme Annuel ────────────────────────────────────────────────
function Step3Programme({ rapport, setRapport, programmeAnnuel, calculStatsProgamme }) {
  useEffect(() => {
    if (rapport.programme_annuel_etat.length === 0 && programmeAnnuel.length > 0) {
      setRapport({
        ...rapport,
        programme_annuel_etat: programmeAnnuel.map(k => ({ khassida_id: k.id, statut: 'pas_commence', pourcentage: 0 }))
      })
    }
  }, [])

  // Calcule le taux moyen des mélodies enregistrées pour un khassida donné
  const getTauxDepuisMelodies = (khassidaId) => {
    const mels = rapport.melodies.filter(m => m.khassida_id === khassidaId)
    if (mels.length === 0) return null
    return Math.round(mels.reduce((sum, m) => sum + (m.taux || 0), 0) / mels.length)
  }

  // Synchronise le pourcentage stocké des khassidas "en_cours" avec le taux réel des mélodies
  const melKey = rapport.melodies.map(m => `${m.khassida_id}:${m.taux}`).sort().join('|')
  useEffect(() => {
    if (rapport.programme_annuel_etat.length === 0) return
    let changed = false
    const updated = rapport.programme_annuel_etat.map(etat => {
      if (etat.statut !== 'en_cours') return etat
      const taux = getTauxDepuisMelodies(etat.khassida_id)
      if (taux === null || taux === etat.pourcentage) return etat
      changed = true
      return { ...etat, pourcentage: taux }
    })
    if (changed) setRapport({ ...rapport, programme_annuel_etat: updated })
  }, [melKey])

  const updateEtat = (khassidaId, statut, pourcentage = 0) => {
    const existe = rapport.programme_annuel_etat.some(e => e.khassida_id === khassidaId)
    const nouvelEtat = existe
      ? rapport.programme_annuel_etat.map(e => e.khassida_id === khassidaId ? { ...e, statut, pourcentage } : e)
      : [...rapport.programme_annuel_etat, { khassida_id: khassidaId, statut, pourcentage }]
    setRapport({ ...rapport, programme_annuel_etat: nouvelEtat })
  }

  const selectionnerEnCours = (khassidaId, pourcentageActuel) => {
    const tauAuto = getTauxDepuisMelodies(khassidaId)
    updateEtat(khassidaId, 'en_cours', tauAuto !== null ? tauAuto : pourcentageActuel)
  }

  const getEtat = (id) =>
    rapport.programme_annuel_etat.find(e => e.khassida_id === id) || { statut: 'pas_commence', pourcentage: 0 }

  const stats = calculStatsProgamme()

  if (programmeAnnuel.length === 0) {
    return (
      <div className="bg-orange-pastel border border-orange-strat rounded-xl p-4 text-sm text-center text-gray-600">
        Aucun khassida dans le programme annuel. Vous pouvez passer cette étape.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats globales */}
      <div className="bg-bleu-pastel border border-bleu-info rounded-xl p-4">
        <p className="text-xs font-bold text-bleu-info mb-3 uppercase tracking-wide">Progression globale</p>
        <div className="grid grid-cols-4 gap-3 mb-3 text-center">
          <div><div className="text-xl font-bold text-vert-principal">{stats.termines}</div><div className="text-xs text-gray-500">Terminés</div></div>
          <div><div className="text-xl font-bold text-orange-strat">{stats.enCours}</div><div className="text-xs text-gray-500">En cours</div></div>
          <div><div className="text-xl font-bold text-rouge-alerte">{stats.pasCommences}</div><div className="text-xs text-gray-500">Non commencés</div></div>
          <div><div className="text-xl font-bold text-bleu-info">{stats.tauxGlobal}%</div><div className="text-xs text-gray-500">Taux global</div></div>
        </div>
        <div className="w-full bg-white bg-opacity-60 rounded-full h-2">
          <div className="bg-bleu-info h-2 rounded-full transition-all" style={{ width: `${stats.tauxGlobal}%` }} />
        </div>
      </div>

      {/* Liste khassidas */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#014421' }}>
          État des khassidas ({programmeAnnuel.length})
        </p>
        <div className="space-y-2">
          {programmeAnnuel.map((k, idx) => {
            const e = getEtat(k.id)
            const tauxAuto = getTauxDepuisMelodies(k.id)
            const aMelodies = tauxAuto !== null
            return (
              <div key={k.id} className={`border rounded-lg p-3 transition-colors ${
                e.statut === 'termine' ? 'border-vert-principal bg-vert-pastel bg-opacity-30' :
                e.statut === 'en_cours' ? 'border-orange-strat bg-orange-pastel bg-opacity-30' :
                'border-gray-100'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#014421' }}>{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: '#014421' }}>{k.nom}</span>
                      {aMelodies && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                          style={{ background: '#E8F5E9', color: '#16824E' }}>
                          {tauxAuto}% depuis mélodies
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{k.melodie}</div>
                  </div>
                </div>

                <div className="flex gap-1 mb-2 bg-gray-100 p-1 rounded-lg w-fit">
                  {/* Terminé */}
                  <button
                    onClick={() => updateEtat(k.id, 'termine', 100)}
                    className={`py-1.5 px-3 rounded text-xs font-semibold transition-all duration-200 ${
                      e.statut === 'termine'
                        ? 'bg-vert-principal text-white shadow-md scale-105'
                        : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Terminé
                  </button>

                  {/* En cours */}
                  <button
                    onClick={() => selectionnerEnCours(k.id, e.pourcentage)}
                    className={`py-1.5 px-3 rounded text-xs font-semibold transition-all duration-200 ${
                      e.statut === 'en_cours'
                        ? 'bg-orange-strat text-white shadow-md scale-105'
                        : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    En cours
                  </button>

                  {/* Pas commencé */}
                  <button
                    onClick={() => updateEtat(k.id, 'pas_commence', 0)}
                    className={`py-1.5 px-3 rounded text-xs font-semibold transition-all duration-200 ${
                      e.statut === 'pas_commence'
                        ? 'bg-rouge-alerte text-white shadow-md scale-105'
                        : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Pas commencé
                  </button>
                </div>

                {e.statut === 'en_cours' && (
                  <div className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white bg-opacity-70 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-300"
                          style={{ width: `${e.pourcentage}%`, background: '#E67E22' }} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input
                          type="number" min="0" max="100" value={e.pourcentage}
                          onChange={(ev) => updateEtat(k.id, 'en_cours', Math.min(100, Math.max(0, parseInt(ev.target.value) || 0)))}
                          className="w-14 px-2 py-1 border border-orange-strat rounded-lg text-xs text-center font-bold focus:outline-none"
                          style={{ color: '#E67E22' }}
                        />
                        <span className="text-xs font-bold text-orange-strat">%</span>
                      </div>
                    </div>
                    {aMelodies && (
                      <p className="text-xs mt-1" style={{ color: '#16824E' }}>
                        Rempli automatiquement · modifiable
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Textareas */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        {[
          { key: 'objectifs_atteints',     label: 'Objectifs atteints',      ph: 'Khassidas terminés...' },
          { key: 'objectifs_en_cours',     label: 'Objectifs en cours',      ph: 'Khassidas en cours...' },
          { key: 'objectifs_non_atteints', label: 'Objectifs non atteints',  ph: 'Khassidas en retard...' },
          { key: 'ajustements',            label: 'Ajustements nécessaires', ph: 'Actions correctives...' },
        ].map(({ key, label, ph }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
            <textarea rows="2" value={rapport.programme_annuel_textes[key]}
              onChange={(e) => setRapport({ ...rapport, programme_annuel_textes: { ...rapport.programme_annuel_textes, [key]: e.target.value } })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none resize-none"
              placeholder={ph} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 4 : Appréciation ───────────────────────────────────────────────────
function Step4Appreciation({ rapport, setRapport, kourel, programmeAnnuel }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Appréciation générale</label>
        <textarea rows="3" value={rapport.appreciation.generale}
          onChange={(e) => setRapport({ ...rapport, appreciation: { ...rapport.appreciation, generale: e.target.value } })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none resize-none"
          placeholder="Bilan global du mois, contexte, dynamique d'équipe..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { key: 'points_positifs', label: 'Points positifs',      color: '#16824E', ph: 'Mélodies terminées, bons rattrapages...' },
          { key: 'a_surveiller',   label: 'À surveiller',          color: '#E67E22', ph: 'Points nécessitant attention...' },
          { key: 'en_retard',      label: 'En retard',             color: '#C0392B', ph: 'Mélodies en retard, actions urgentes...' },
          { key: 'priorites',      label: 'Priorités mois suivant',color: '#34495E', ph: 'Objectifs du prochain mois...' },
        ].map(({ key, label, color, ph }) => (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color }}>
              {label}
            </label>
            <textarea rows="3" value={rapport.appreciation[key]}
              onChange={(e) => setRapport({ ...rapport, appreciation: { ...rapport.appreciation, [key]: e.target.value } })}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none resize-none"
              style={{ borderColor: color + '55' }}
              placeholder={ph} />
          </div>
        ))}
      </div>

      <div className="bg-vert-pastel border border-vert-principal rounded-xl p-4">
        <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#014421' }}>Résumé</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
          <div><span className="font-semibold">Kourel :</span> {kourel.nom}</div>
          <div><span className="font-semibold">Période :</span> {rapport.mois} {rapport.annee}</div>
          <div><span className="font-semibold">Mélodies :</span> {rapport.melodies.length} ajoutées</div>
          <div><span className="font-semibold">Programme :</span> {rapport.programme_annuel_etat.length > 0 ? 'Configuré' : 'Non configuré'}</div>
        </div>
      </div>
    </div>
  )
}

// ─── STEPPER ──────────────────────────────────────────────────────────────────
function Stepper({ etape }) {
  const steps = [
    { label: 'Identification', Icon: User },
    { label: 'Mélodies',       Icon: Music },
    { label: 'Programme',      Icon: CalendarDays },
    { label: 'Appréciation',   Icon: Star },
  ]
  return (
    <div className="flex items-center justify-center px-1 sm:px-2">
      {steps.map((s, i) => {
        const num = i + 1
        const done = num < etape
        const actif = num === etape
        return (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center" style={{ minWidth: 'clamp(45px, 12vw, 70px)' }}>
              <div className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: 'clamp(24px, 7vw, 38px)', 
                  height: 'clamp(24px, 7vw, 38px)',
                  background: done ? '#16824E' : actif ? '#014421' : '#F3F4F6',
                  boxShadow: actif ? '0 0 0 2px #E8F5E9' : 'none',
                }}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} style={{ width: 'clamp(10px, 3vw, 16px)', height: 'clamp(10px, 3vw, 16px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <s.Icon size={12} color={actif ? '#fff' : '#9CA3AF'} strokeWidth={2} style={{ width: 'clamp(10px, 3vw, 16px)', height: 'clamp(10px, 3vw, 16px)' }} />
                )}
              </div>
              <span className="mt-0.5 text-center leading-tight" style={{
                fontSize: 'clamp(7px, 2.5vw, 11px)', fontWeight: actif ? 700 : 500,
                color: done ? '#16824E' : actif ? '#014421' : '#9CA3AF',
                maxWidth: 'clamp(40px, 10vw, 62px)',
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, width: 'clamp(12px, 4vw, 44px)', marginTop: '10px', marginLeft: '1px', marginRight: '1px',
                borderRadius: 2, background: done ? '#16824E' : '#E5E7EB',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── LOADING MODAL ────────────────────────────────────────────────────────────
function LoadingModal({ progress, succes }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 max-w-xs w-full mx-4 shadow-2xl flex flex-col items-center gap-6">
        {succes ? (
          <div className="w-16 h-16 bg-vert-pastel rounded-full flex items-center justify-center">
            <svg className="w-9 h-9 text-vert-principal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full animate-spin border-4"
            style={{ borderColor: '#E8F5E9', borderTopColor: '#16824E' }} />
        )}
        <p className="text-lg font-bold text-vert-fonce text-center">
          {succes ? 'PDF téléchargé !' : 'Génération du PDF...'}
        </p>
        <div className="w-full relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: succes ? '#16824E' : 'linear-gradient(90deg, #014421, #16824E, #8CD2B4)'
            }} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  )
}
