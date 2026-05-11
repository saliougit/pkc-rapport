import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Save, CheckCircle2, Clock, Calendar, MapPin, Users, Star, Music, ClipboardCheck, Loader, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

// ─── Données mock ───────────────────────────────────────────────────────────
const MEMBRES = [
  { id: 1, prenom: 'Ibrahima', nom: 'Fall', kourel: 'Kourel Serigne Babacar Sy' },
  { id: 2, prenom: 'Moussa', nom: 'Diop', kourel: 'Kourel El Hadj Malick Sy' },
  { id: 3, prenom: 'Abdoulaye', nom: 'Niang', kourel: 'Kourel Serigne Moussa Ka' },
  { id: 4, prenom: 'Cheikh', nom: 'Mbaye', kourel: 'Kourel Mame Thierno' },
  { id: 5, prenom: 'Fatou', nom: 'Sow', kourel: 'Kourel Serigne Babacar Sy' },
]
const TYPES = ['Goudj', 'Aldiouma', 'Ziar', 'Magal']

// Simulation de codes valides (format: EVAL-{evenement_id}-{membre_id})
const CODES = {
  'EVAL-001-01': { evenement_id: 1, membre_id: 1 },
  'EVAL-001-02': { evenement_id: 1, membre_id: 2 },
  'EVAL-002-02': { evenement_id: 2, membre_id: 2 },
  'EVAL-002-03': { evenement_id: 2, membre_id: 3 },
  'EVAL-002-05': { evenement_id: 2, membre_id: 5 },
  'EVAL-003-01': { evenement_id: 3, membre_id: 1 },
  'EVAL-003-03': { evenement_id: 3, membre_id: 3 },
  'EVAL-003-04': { evenement_id: 3, membre_id: 4 },
}

const EVENEMENTS = [
  { id: 1, type_id: 1, date: '2026-04-15', lieu: 'CAMPUS', kourel: 'Kourel Serigne Babacar Sy', evaluateurs: [1, 2], statut: 'terminé' },
  { id: 2, type_id: 2, date: '2026-05-02', lieu: 'ESP', kourel: 'Kourel El Hadj Malick Sy', evaluateurs: [2, 3, 5], statut: 'à venir' },
  { id: 3, type_id: 4, date: '2026-05-20', lieu: 'CAMPUS', kourel: 'Kourel Serigne Moussa Ka', evaluateurs: [1, 3, 4], statut: 'en cours' },
]

const SECTIONS = [
  { id: 'melodie', label: 'Maitrise de la mélodie', icon: Music },
  { id: 'hourouf', label: 'Phonétique "Hourouf"', icon: FileText },
  { id: 'timing', label: 'Temps de prestation', icon: Clock },
  { id: 'discipline', label: 'Discipline', icon: Users },
  { id: 'ponctualite', label: 'Ponctualité / Présence', icon: Clock },
]

const APPRECIATIONS = ['Mauvais', 'Médiocre', 'Passable', 'Bien', 'Très bien', 'Excellent']

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getTypeName(id) { return TYPES[id - 1] || '—' }

const sectionVide = () => ({ appreciation: '', remarques: '', note: null })

// ─── STEPPER ────────────────────────────────────────────────────────────────
function Stepper({ etape }) {
  const steps = [
    { label: 'Identification', Icon: Calendar },
    { label: 'Évaluation', Icon: ClipboardCheck },
    { label: 'Finalisation', Icon: Star },
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
                  width: 'clamp(24px, 7vw, 38px)', height: 'clamp(24px, 7vw, 38px)',
                  background: done ? '#16824E' : actif ? '#014421' : '#F3F4F6',
                  boxShadow: actif ? '0 0 0 2px #E8F5E9' : 'none',
                }}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}
                    style={{ width: 'clamp(10px, 3vw, 16px)', height: 'clamp(10px, 3vw, 16px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <s.Icon size={12} color={actif ? '#fff' : '#9CA3AF'} strokeWidth={2}
                    style={{ width: 'clamp(10px, 3vw, 16px)', height: 'clamp(10px, 3vw, 16px)' }} />
                )}
              </div>
              <span className="mt-0.5 text-center leading-tight" style={{
                fontSize: 'clamp(7px, 2.5vw, 11px)', fontWeight: actif ? 700 : 500,
                color: done ? '#16824E' : actif ? '#014421' : '#9CA3AF',
                maxWidth: 'clamp(40px, 10vw, 62px)',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, width: 'clamp(12px, 4vw, 44px)', marginTop: '10px',
                marginLeft: '1px', marginRight: '1px', borderRadius: 2,
                background: done ? '#16824E' : '#E5E7EB', transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── LOADING MODAL ──────────────────────────────────────────────────────────
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
          {succes ? 'Évaluation soumise !' : 'Soumission en cours...'}
        </p>
        <div className="w-full relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: succes ? '#16824E' : 'linear-gradient(90deg, #014421, #16824E, #8CD2B4)'
            }} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{progress}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────
export default function EvaluationMembre() {
  const [searchParams] = useSearchParams()
  const codeParam = searchParams.get('code') || ''

  const [etape, setEtape] = useState(codeParam ? 2 : 1)
  const [code, setCode] = useState(codeParam)
  const [codeError, setCodeError] = useState('')
  const [codeValide, setCodeValide] = useState(null)
  const [validating, setValidating] = useState(!!codeParam)

  const [evalData, setEvalData] = useState(() => {
    const notes = {}
    SECTIONS.forEach(s => { notes[s.id] = sectionVide() })
    return { notes, note_finale: null, commentaire: '', soumis: false }
  })
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [succes, setSucces] = useState(false)

  // Valider le code synchrone à l'initialisation si présent dans l'URL
  useEffect(() => {
    if (codeParam) {
      const cUpper = codeParam.toUpperCase().trim()
      const data = CODES[cUpper]
      if (data) {
        const evenement = EVENEMENTS.find(e => e.id === data.evenement_id)
        const membre = MEMBRES.find(m => m.id === data.membre_id)
        if (evenement && membre) {
          setCodeValide({ code: cUpper, evenement, membre })
          setValidating(false)
          setEtape(2)
          return
        }
      }
      setCodeError('Code invalide ou expiré.')
      setValidating(false)
    }
  }, [])

  const validerCode = (c) => {
    const cUpper = c.toUpperCase().trim()
    const data = CODES[cUpper]
    if (!data) {
      setCodeError('Code invalide. Vérifiez votre code et réessayez.')
      return
    }
    const evenement = EVENEMENTS.find(e => e.id === data.evenement_id)
    if (!evenement) {
      setCodeError('Événement introuvable pour ce code.')
      return
    }
    const membre = MEMBRES.find(m => m.id === data.membre_id)
    setCodeValide({ code: cUpper, evenement, membre })
    setCodeError('')
    setEtape(2)
  }

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) { setCodeError('Veuillez entrer un code'); return }
    validerCode(code)
  }

  const updateSection = (sectionId, field, value) => {
    setEvalData(prev => ({
      ...prev,
      notes: { ...prev.notes, [sectionId]: { ...prev.notes[sectionId], [field]: value } },
    }))
  }

  const getMoyenne = () => {
    const vals = SECTIONS.map(s => evalData.notes[s.id]?.note).filter(v => v != null)
    if (!vals.length) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const peutPasserEtape2 = () => {
    return SECTIONS.every(s => evalData.notes[s.id]?.note != null)
  }

  const soumettre = async () => {
    setSaving(true)
    setProgress(0)
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99
        const inc = prev < 20 ? 5 : prev < 45 ? 2.5 : prev < 80 ? 0.8 : 0.15
        return Math.min(99, Math.round((prev + inc) * 10) / 10)
      })
    }, 200)
    await new Promise(r => setTimeout(r, 1500))
    clearInterval(timer)
    setProgress(100)
    setSucces(true)
    const toSave = { ...evalData, soumis: true }
    if (codeValide) {
      localStorage.setItem(`eval_${codeValide.evenement.id}_${codeValide.membre.id}`, JSON.stringify(toSave))
    }
    setEvalData(toSave)
    setTimeout(() => { setSaving(false); setSucces(false) }, 1500)
  }

  // ── Écran de validation ─────────────────────────────────────────────────
  if (validating) {
    return (
      <div className="min-h-screen bg-gris-clair flex items-center justify-center">
        <Loader size={24} className="animate-spin text-vert-700" />
      </div>
    )
  }

  // ── Écran de saisie du code ─────────────────────────────────────────────
  if (!codeValide) {
    return (
      <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          <div className="bg-vert-800 text-white px-5 py-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1 flex-shrink-0">
                <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-sm">DMN · Évaluation</p>
                <p className="text-xs text-vert-200">Comité Suivi & Évaluation</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-b-2xl p-6">
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-vert-800 uppercase tracking-wider mb-1">
                  Code d'accès
                </p>
                <p className="text-xs text-gris-500 mb-4">
                  Saisissez le code qui vous a été communiqué.
                </p>
                <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                  Code
                </label>
                <Input
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError('') }}
                  placeholder="EX: EVAL-001-01"
                  className="w-full h-11 text-lg font-mono tracking-[0.25em] uppercase text-center"
                  autoFocus
                />
                {codeError && (
                  <p className="text-xs text-rouge mt-2 flex items-center gap-1">
                    <span>⚠</span> {codeError}
                  </p>
                )}
              </div>
              <button type="submit" disabled={!code.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl bg-vert-700 hover:opacity-90 disabled:opacity-40 transition"
              >
                Accéder à l'évaluation <ChevronRight size={16} />
              </button>
              <p className="text-[10px] text-gris-400 text-center">
                En cas de perte du code, contactez l'administrateur.
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const { evenement, membre } = codeValide

  // ── Conteneur principal avec stepper ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gris-clair flex flex-col items-center px-2 sm:px-4 py-2 sm:py-4">
      {saving && <LoadingModal progress={Math.round(progress)} succes={succes} />}

      <div className="w-full max-w-5xl flex flex-col rounded-2xl shadow-xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 1rem)' }}>

        {/* Stepper */}
        <div className="bg-white px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-2 sm:pb-3 flex-shrink-0 border-b border-gray-100">
          <Stepper etape={etape} />
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
          {/* ── ÉTAPE 1 : Identification ── */}
          {etape === 1 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gris-100">
                <div className="w-12 h-12 rounded-xl bg-vert-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-vert-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gris-950">{getTypeName(evenement.type_id)}</p>
                  <p className="text-xs text-gris-500">{evenement.kourel}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gris-400 mb-1 uppercase tracking-wide">Date</label>
                  <input type="text" value={formatDate(evenement.date)} disabled
                    className="w-full px-3 py-2 text-sm bg-gris-50 border border-gris-200 rounded-lg text-gris-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gris-400 mb-1 uppercase tracking-wide">Lieu</label>
                  <input type="text" value={evenement.lieu} disabled
                    className="w-full px-3 py-2 text-sm bg-gris-50 border border-gris-200 rounded-lg text-gris-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gris-400 mb-1 uppercase tracking-wide">Koureul</label>
                  <input type="text" value={evenement.kourel} disabled
                    className="w-full px-3 py-2 text-sm bg-gris-50 border border-gris-200 rounded-lg text-gris-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gris-400 mb-1 uppercase tracking-wide">Évaluateur</label>
                  <input type="text" value={`${membre.prenom} ${membre.nom}`} disabled
                    className="w-full px-3 py-2 text-sm bg-gris-50 border border-gris-200 rounded-lg text-gris-700" />
                </div>
              </div>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                Code : <strong className="font-mono">{codeValide.code}</strong>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Évaluation par sections ── */}
          {etape === 2 && (
            <div className="space-y-4">
              {SECTIONS.map(section => {
                const s = evalData.notes[section.id]
                const Icon = section.icon
                return (
                  <div key={section.id} className="bg-white rounded-xl p-5 shadow-sm border border-gris-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={15} className="text-vert-700" />
                      <p className="text-sm font-bold text-gris-950">{section.label}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                          Appréciation
                        </label>
                        <ToggleGroup
                          type="single"
                          value={s.appreciation}
                          onValueChange={v => { if (v) updateSection(section.id, 'appreciation', v) }}
                          variant="outline" size="sm"
                          className="flex-wrap gap-1 sm:gap-0"
                        >
                          {APPRECIATIONS.map((a, i) => (
                            <ToggleGroupItem key={a} value={a}
                              className={cn(
                                "data-[state=on]:bg-vert-700 data-[state=on]:text-white data-[state=on]:border-vert-700 data-[state=on]:hover:bg-vert-700",
                                "rounded-full",
                                "sm:rounded-none sm:first:rounded-l-full sm:last:rounded-r-full",
                                i !== APPRECIATIONS.length - 1 && "sm:[&:not(:last-child)]:border-r-0",
                              )}
                            >
                              {a}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                          Note /10
                        </label>
                        <input type="number" min="1" max="10" step="0.5"
                          value={s.note ?? ''}
                          onChange={e => updateSection(section.id, 'note', e.target.value === '' ? null : Math.min(10, Math.max(1, parseFloat(e.target.value))))}
                          className="w-24 px-3 py-2 text-sm border border-gris-200 rounded-lg focus:border-vert-700 focus:outline-none"
                          placeholder="1-10" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                        Remarques <span className="font-normal normal-case">(optionnel)</span>
                      </label>
                      <textarea value={s.remarques}
                        onChange={e => updateSection(section.id, 'remarques', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gris-200 rounded-lg focus:border-vert-700 focus:outline-none resize-none"
                        placeholder="Observations..." />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ÉTAPE 3 : Finalisation ── */}
          {etape === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm font-bold text-gris-950 mb-4">Appréciation générale</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                      Note finale /10
                    </label>
                    <input type="number" min="1" max="10" step="0.5"
                      value={evalData.note_finale ?? ''}
                      onChange={e => setEvalData(prev => ({ ...prev, note_finale: e.target.value === '' ? null : Math.min(10, Math.max(1, parseFloat(e.target.value))) }))}
                      className="w-full px-3 py-2 text-sm border border-gris-200 rounded-lg focus:border-vert-700 focus:outline-none"
                      placeholder="Note globale sur 10" />
                  </div>
                  <div className="flex items-end">
                    <div className="text-xs text-gris-600 bg-gris-50 rounded-lg px-3 py-2 border border-gris-200 w-full">
                      <span className="font-semibold text-gris-700">Moyenne des sections : </span>
                      {getMoyenne() != null ? (
                        <span className="font-bold text-vert-700">{getMoyenne()}/10</span>
                      ) : (
                        <span className="text-gris-400 italic">—</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                    Commentaire général
                  </label>
                  <textarea value={evalData.commentaire}
                    onChange={e => setEvalData(prev => ({ ...prev, commentaire: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gris-200 rounded-lg focus:border-vert-700 focus:outline-none resize-none"
                    placeholder="Votre appréciation globale..." />
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-vert-50 border border-vert-200 rounded-xl p-5">
                <p className="text-xs font-bold text-vert-800 uppercase tracking-wider mb-3">Récapitulatif</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gris-700">
                    <div><span className="font-semibold text-vert-700">Événement :</span> {getTypeName(evenement.type_id)}</div>
                    <div><span className="font-semibold text-vert-700">Date :</span> {formatDate(evenement.date)}</div>
                    <div><span className="font-semibold text-vert-700">Lieu :</span> {evenement.lieu}</div>
                    <div><span className="font-semibold text-vert-700">Koureul :</span> {evenement.kourel}</div>
                  </div>
                  <div className="pt-2 border-t border-vert-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-vert-700">Évaluateur :</span>
                      <span>{membre.prenom} {membre.nom}</span>
                    </div>
                    {getMoyenne() != null && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="font-semibold text-vert-700">Moyenne sections :</span>
                        <span className="font-bold">{getMoyenne()}/10</span>
                      </div>
                    )}
                    {evalData.note_finale != null && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="font-semibold text-vert-700">Note finale :</span>
                        <span className="font-bold text-vert-800">{evalData.note_finale}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex-shrink-0 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <button onClick={() => setEtape(etape - 1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-gris-500 hover:opacity-90 transition"
          >
            <ChevronLeft size={16} />
            {etape === 2 ? 'Retour au code' : 'Précédent'}
          </button>

          {etape === 3 ? (
            <button onClick={soumettre} disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-vert-700 hover:opacity-90 disabled:opacity-40 transition"
            >
              {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? 'Soumission...' : 'Soumettre l\'évaluation'}
            </button>
          ) : (
            <button onClick={() => setEtape(etape + 1)}
              disabled={etape === 2 && !peutPasserEtape2()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-vert-700 hover:opacity-90 disabled:opacity-40 transition"
            >
              Suivant <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
