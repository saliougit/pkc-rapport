import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, CheckCircle2, Clock,
  Calendar, MapPin, Users, Music, FileText,
  ArrowLeft, ArrowRight, AlertCircle,
} from 'lucide-react'

// ─── Données mock ─────────────────────────────────────────────────────────────

const MEMBRES = [
  { id: 1, prenom: 'Ibrahima',   nom: 'Fall',  kourel: 'Kourel Serigne Babacar Sy' },
  { id: 2, prenom: 'Moussa',     nom: 'Diop',  kourel: 'Kourel El Hadj Malick Sy' },
  { id: 3, prenom: 'Abdoulaye',  nom: 'Niang', kourel: 'Kourel Serigne Moussa Ka' },
  { id: 4, prenom: 'Cheikh',     nom: 'Mbaye', kourel: 'Kourel Mame Thierno' },
  { id: 5, prenom: 'Fatou',      nom: 'Sow',   kourel: 'Kourel Serigne Babacar Sy' },
]
const TYPES = ['Goudj', 'Aldiouma', 'Ziar', 'Magal']
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
  { id: 1, type_id: 1, date: '2026-04-15', lieu: 'CAMPUS', kourel: 'Kourel Serigne Babacar Sy', statut: 'terminé' },
  { id: 2, type_id: 2, date: '2026-05-02', lieu: 'ESP',    kourel: 'Kourel El Hadj Malick Sy',  statut: 'à venir' },
  { id: 3, type_id: 4, date: '2026-05-20', lieu: 'CAMPUS', kourel: 'Kourel Serigne Moussa Ka',  statut: 'en cours' },
]

const SECTIONS = [
  { id: 'melodie',     label: 'Maitrise de la mélodie',  icon: Music,         color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'hourouf',     label: 'Phonétique "Hourouf"',    icon: FileText,      color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'timing',      label: 'Temps de prestation',     icon: Clock,         color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'discipline',  label: 'Discipline',              icon: Users,         color: '#EF4444', bg: '#FEF2F2' },
  { id: 'ponctualite', label: 'Ponctualité / Présence',  icon: Calendar,      color: '#10B981', bg: '#ECFDF5' },
]

const APPRECIATIONS = [
  { label: 'Mauvais',   value: 'Mauvais',   color: '#ee6161', bg: '#FEF2F2', active: '#EF4444', min: 0,   max: 2,   mid: 1   },
  { label: 'Médiocre',  value: 'Médiocre',  color: '#F97316', bg: '#FFF7ED', active: '#F97316', min: 2.5, max: 4,   mid: 3   },
  { label: 'Passable',  value: 'Passable',  color: '#EAB308', bg: '#FEFCE8', active: '#EAB308', min: 4.5, max: 5.5, mid: 5   },
  { label: 'Bien',      value: 'Bien',      color: '#22C55E', bg: '#F0FDF4', active: '#22C55E', min: 6,   max: 7.5, mid: 7   },
  { label: 'Très bien', value: 'Très bien', color: '#16824E', bg: '#F0FDF4', active: '#16824E', min: 8,   max: 9,   mid: 8.5 },
  { label: 'Excellent', value: 'Excellent', color: '#014421', bg: '#DCFCE7', active: '#014421', min: 9.5, max: 10,  mid: 10  },
]

function getAppreciationFromNote(note) {
  if (note == null) return ''
  return APPRECIATIONS.find(a => note >= a.min && note <= a.max)?.value ?? ''
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function getTypeName(id) { return TYPES[id - 1] || '—' }
const sectionVide = () => ({ appreciation: '', note: null, remarques: '' })

// ─── Composant NoteSelector ───────────────────────────────────────────────────

function NoteSelector({ value, onChange }) {
  const dec = () => onChange(Math.max(0, (value ?? 0) - 0.5))
  const inc = () => onChange(Math.min(10, (value ?? 0) + 0.5))
  const pct = ((value ?? 0) / 10) * 100
  const noteColor = !value ? '#9CA3AF'
    : value < 4 ? '#EF4444'
    : value < 6 ? '#F97316'
    : value < 8 ? '#EAB308'
    : '#16824E'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={dec}
          disabled={!value || value <= 0}
          className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all"
        >
          −
        </button>

        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300"
            style={{
              borderColor: noteColor,
              background: value ? noteColor + '15' : '#F9FAFB',
            }}
          >
            <span
              className="text-2xl font-black leading-none"
              style={{ color: noteColor }}
            >
              {value != null ? value : '—'}
            </span>
          </div>
          <span className="text-[10px] text-gris-400 mt-1">/10</span>
        </div>

        <button
          type="button"
          onClick={inc}
          disabled={value >= 10}
          className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gris-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: noteColor }}
        />
      </div>
    </div>
  )
}

// ─── Carte section (étape 2) ──────────────────────────────────────────────────

function SectionCard({ section, data, onChange, index, total }) {
  const Icon = section.icon
  const donePct = Math.round(((index) / total) * 100)

  return (
    <div className="flex flex-col gap-5">
      {/* En-tête section */}
      <div className="rounded-2xl overflow-hidden" style={{ background: section.bg, border: `1.5px solid ${section.color}22` }}>
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ background: section.color }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon size={20} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight">{section.label}</p>
            <p className="text-white/70 text-xs mt-0.5">{index}/{total} sections</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{Math.round((index / total) * 100)}%</span>
          </div>
        </div>
        {/* Mini progress */}
        <div className="h-1 bg-white/30">
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${donePct}%`, background: 'white' }}
          />
        </div>
      </div>

      {/* Appréciation */}
      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">
          Appréciation
        </p>
        <div className="grid grid-cols-3 gap-2">
          {APPRECIATIONS.map(a => {
            const selected = data.appreciation === a.value
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange({ appreciation: a.value, note: a.mid })}
                className="py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 active:scale-95"
                style={{
                  borderColor: selected ? a.active : '#E5E7EB',
                  background: selected ? a.active : 'white',
                  color: selected ? 'white' : a.color,
                }}
              >
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">
          Note
        </p>
        <div className="bg-gris-50 rounded-2xl py-5 px-4">
          <NoteSelector
            value={data.note}
            onChange={v => onChange({ note: v, appreciation: getAppreciationFromNote(v) })}
          />
        </div>
      </div>

      {/* Remarques */}
      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-2">
          Remarques <span className="font-normal normal-case text-gris-400">(optionnel)</span>
        </p>
        <textarea
          value={data.remarques}
          onChange={e => onChange({ remarques: e.target.value })}
          rows={3}
          placeholder="Vos observations sur cette section…"
          className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none bg-white placeholder:text-gris-400"
        />
      </div>
    </div>
  )
}

// ─── Toast validation ─────────────────────────────────────────────────────────

function Toast({ manque, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const msg = manque.includes('appreciation') && manque.includes('note')
    ? 'Choisissez une appréciation et une note'
    : manque.includes('appreciation')
    ? 'Choisissez une appréciation'
    : 'Donnez une note sur 10'

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="flex items-center gap-2.5 bg-gris-950 text-white px-4 py-3 rounded-2xl shadow-lg max-w-xs w-full pointer-events-auto">
        <AlertCircle size={16} className="flex-shrink-0 text-orange-400" />
        <p className="text-sm font-semibold">{msg}</p>
      </div>
    </div>
  )
}

// ─── Dots stepper ─────────────────────────────────────────────────────────────

function DotsStep({ etape }) {
  const steps = ['Identification', 'Évaluation', 'Finalisation']
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((s, i) => {
        const n = i + 1
        const done = n < etape
        const actif = n === etape
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: actif ? 32 : 24,
                  height: actif ? 32 : 24,
                  background: done ? '#16824E' : actif ? '#014421' : '#E5E7EB',
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold" style={{ color: actif ? 'white' : '#9CA3AF' }}>{n}</span>
                )}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: done ? '#16824E' : actif ? '#014421' : '#9CA3AF' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-0.5 rounded mb-4" style={{ background: done ? '#16824E' : '#E5E7EB' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Écran saisie du code ─────────────────────────────────────────────────────

function EcranCode({ onValide }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const valider = (e) => {
    e?.preventDefault()
    const cUpper = code.toUpperCase().trim()
    if (!cUpper) { setError('Veuillez entrer votre code.'); return }
    const data = CODES[cUpper]
    if (!data) { setError('Code invalide. Vérifiez le code reçu.'); return }
    const evenement = EVENEMENTS.find(e => e.id === data.evenement_id)
    const membre = MEMBRES.find(m => m.id === data.membre_id)
    if (!evenement || !membre) { setError('Événement introuvable.'); return }
    onValide({ code: cUpper, evenement, membre })
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#014421' }}>
    <div className="w-full max-w-md flex flex-col min-h-screen">
      {/* Haut décoratif */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-12 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-lg">
          <img src="/images/logo-dmn.png" alt="DMN" className="w-11 h-11 object-contain" />
        </div>
        <h1 className="text-white text-xl font-black text-center mb-1">DMN · Évaluation</h1>
        <p className="text-vert-200 text-xs text-center">Comité Suivi & Évaluation</p>
      </div>

      {/* Card code */}
      <div className="bg-white rounded-t-3xl px-5 pt-8 pb-8 shadow-2xl">
        <p className="text-gris-950 text-lg font-black mb-1">Accéder à l'évaluation</p>
        <p className="text-gris-500 text-sm mb-6">
          Saisissez le code qui vous a été communiqué par l'administrateur.
        </p>

        <form onSubmit={valider} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gris-500 uppercase tracking-widest mb-2">
              Code d'accès
            </label>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="EVAL-001-01"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full h-14 px-4 text-xl font-mono tracking-[0.3em] uppercase text-center border-2 rounded-2xl outline-none transition-all"
              style={{
                borderColor: error ? '#EF4444' : code ? '#014421' : '#E5E7EB',
                color: '#014421',
              }}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <span className="text-red-500 text-sm">⚠</span>
                <p className="text-red-600 text-xs font-semibold">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: '#016030' }}
          >
            Accéder <ChevronRight size={18} />
          </button>

          <p className="text-[11px] text-gris-400 text-center">
            Code perdu ? Contactez l'administrateur du comité.
          </p>
        </form>

        {/* Exemples de codes pour la démo */}
        <div className="mt-5 pt-5 border-t border-gris-100">
          <p className="text-[10px] font-bold text-gris-400 uppercase tracking-widest mb-2">Codes de test</p>
          <div className="flex flex-wrap gap-1.5">
            {['EVAL-001-01', 'EVAL-002-02', 'EVAL-003-04'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setCode(c); setError('') }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-vert-50 text-vert-800 border border-vert-200"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function EvaluationMembre() {
  const [searchParams] = useSearchParams()
  const codeParam = searchParams.get('code') || ''

  const [codeValide, setCodeValide] = useState(null)
  const [etape, setEtape] = useState(1)
  const [sectionIdx, setSectionIdx] = useState(0)

  const [evalData, setEvalData] = useState(() => {
    const notes = {}
    SECTIONS.forEach(s => { notes[s.id] = sectionVide() })
    return { notes, note_finale: null, commentaire: '', soumis: false }
  })

  const [saving, setSaving] = useState(false)
  const [soumis, setSoumis] = useState(false)
  const [popup, setPopup] = useState(null) // { sectionLabel, manque[] }

  // Validation automatique du code en URL
  useEffect(() => {
    if (!codeParam) return
    const cUpper = codeParam.toUpperCase().trim()
    const data = CODES[cUpper]
    if (!data) return
    const evenement = EVENEMENTS.find(e => e.id === data.evenement_id)
    const membre = MEMBRES.find(m => m.id === data.membre_id)
    if (evenement && membre) {
      setCodeValide({ code: cUpper, evenement, membre })
      setEtape(1)
    }
  }, [])

  const updateSection = (sectionId, changes) => {
    setEvalData(prev => ({
      ...prev,
      notes: { ...prev.notes, [sectionId]: { ...prev.notes[sectionId], ...changes } },
    }))
  }

  const getMoyenne = () => {
    const vals = SECTIONS.map(s => evalData.notes[s.id]?.note).filter(v => v != null)
    if (!vals.length) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const sectionComplete = (id) => {
    const n = evalData.notes[id]
    return n.appreciation && n.note != null
  }

  const sectionsCompletes = SECTIONS.filter(s => sectionComplete(s.id)).length

  const validerEtAvancer = (cible) => {
    const section = SECTIONS[sectionIdx]
    const n = evalData.notes[section.id]
    const manque = []
    if (!n.appreciation) manque.push('appreciation')
    if (n.note == null) manque.push('note')
    if (manque.length > 0) {
      setPopup({ sectionLabel: section.label, manque })
      return
    }
    cible()
  }

  const validerEtFinaliser = () => {
    const premiere = SECTIONS.find(s => !sectionComplete(s.id))
    if (premiere) {
      const n = evalData.notes[premiere.id]
      const manque = []
      if (!n.appreciation) manque.push('appreciation')
      if (n.note == null) manque.push('note')
      setSectionIdx(SECTIONS.indexOf(premiere))
      setPopup({ sectionLabel: premiere.label, manque })
      return
    }
    setEtape(3)
  }

  const soumettre = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1500))
    setSaving(false)
    setSoumis(true)
    if (codeValide) {
      localStorage.setItem(
        `eval_${codeValide.evenement.id}_${codeValide.membre.id}`,
        JSON.stringify({ ...evalData, soumis: true })
      )
    }
  }

  // ── Pas encore de code valide ───────────────────────────────────────────────
  if (!codeValide) {
    return <EcranCode onValide={cv => { setCodeValide(cv); setEtape(1) }} />
  }

  const { evenement, membre } = codeValide

  // ── Succès ──────────────────────────────────────────────────────────────────
  if (soumis) {
    return (
      <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-md flex flex-col items-center justify-center px-6 min-h-screen">
        <style>{`
          @keyframes bgScale {
            0%   { transform: scale(0); opacity: 0; }
            65%  { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes drawCircle {
            from { stroke-dashoffset: 290; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes drawCheck {
            from { stroke-dashoffset: 82; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes burst {
            0%   { opacity: 1; transform: translate(0,0) scale(1.2); }
            100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-up-1  { animation: fadeUp 0.45s ease 0.7s both; }
          .anim-up-2  { animation: fadeUp 0.45s ease 0.85s both; }
          .anim-up-3  { animation: fadeUp 0.45s ease 1s both; }
        `}</style>

        <div className="text-center w-full max-w-xs">
          {/* Icône animée SVG */}
          <div className="relative flex items-center justify-center mx-auto mb-8" style={{ width: 120, height: 120 }}>
            {/* Particules burst */}
            {[
              { tx: '52px',  ty: '0px'   },
              { tx: '37px',  ty: '37px'  },
              { tx: '0px',   ty: '52px'  },
              { tx: '-37px', ty: '37px'  },
              { tx: '-52px', ty: '0px'   },
              { tx: '-37px', ty: '-37px' },
              { tx: '0px',   ty: '-52px' },
              { tx: '37px',  ty: '-37px' },
            ].map((p, i) => (
              <div key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 2 === 0 ? 8 : 6,
                  height: i % 2 === 0 ? 8 : 6,
                  background: i % 3 === 0 ? '#016030' : i % 3 === 1 ? '#4ADE80' : '#BBF7D0',
                  top: '50%', left: '50%',
                  marginTop: i % 2 === 0 ? -4 : -3,
                  marginLeft: i % 2 === 0 ? -4 : -3,
                  '--tx': p.tx,
                  '--ty': p.ty,
                  animation: `burst 0.65s cubic-bezier(.2,.8,.4,1) ${0.45 + i * 0.03}s both`,
                }}
              />
            ))}
            {/* SVG animé */}
            <svg viewBox="0 0 100 100" width="120" height="120" fill="none">
              {/* Fond vert scale-in */}
              <circle
                cx="50" cy="50" r="46"
                fill="#016030"
                style={{ transformOrigin: '50px 50px', animation: 'bgScale 0.55s cubic-bezier(.34,1.56,.64,1) 0.05s both' }}
              />
              {/* Cercle outline qui se dessine */}
              <circle
                cx="50" cy="50" r="46"
                stroke="#4ADE80" strokeWidth="2.5" fill="none"
                strokeDasharray="290" strokeDashoffset="290"
                style={{ animation: 'drawCircle 0.55s ease 0.05s both' }}
              />
              {/* Checkmark qui se dessine */}
              <path
                d="M 24 52 L 42 70 L 76 30"
                stroke="white" strokeWidth="6.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="82" strokeDashoffset="82"
                style={{ animation: 'drawCheck 0.38s cubic-bezier(.4,0,.2,1) 0.55s both' }}
              />
            </svg>
          </div>

          {/* Titre */}
          <h2 className="text-3xl font-black text-gris-950 mb-1 anim-up-1" style={{ letterSpacing: '-0.02em' }}>
            Dieureudieuf Dieuwrinn
          </h2>
          <p className="text-sm text-gris-500 anim-up-2">
            {membre.prenom}, votre évaluation a bien été enregistrée.
          </p>

          {/* Infos événement */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 anim-up-2">
            <span className="flex items-center gap-1.5 bg-gris-50 text-gris-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gris-100">
              <Calendar size={12} />{getTypeName(evenement.type_id)}
            </span>
            <span className="flex items-center gap-1.5 bg-gris-50 text-gris-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gris-100">
              <Clock size={12} />{formatDate(evenement.date)}
            </span>
          </div>

          {/* Moyenne */}
          {getMoyenne() && (
            <div className="mt-6 rounded-2xl px-8 py-5 anim-up-3" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
              <p className="text-xs font-bold text-vert-600 uppercase tracking-widest mb-1">Votre moyenne</p>
              <p className="text-5xl font-black" style={{ color: '#016030' }}>
                {getMoyenne()}<span className="text-xl text-vert-400">/10</span>
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    )
  }

  // ── Loading modal ───────────────────────────────────────────────────────────
  if (saving) {
    return (
      <div className="min-h-screen flex justify-center bg-gris-50">
        <div className="w-full max-w-md flex flex-col items-center justify-center px-5 min-h-screen">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-xl">
            <div className="w-16 h-16 rounded-full animate-spin border-4 mx-auto mb-5"
              style={{ borderColor: '#E8F5E9', borderTopColor: '#16824E' }} />
            <p className="text-gris-950 font-bold text-lg">Soumission en cours…</p>
            <p className="text-gris-500 text-sm mt-1">Veuillez patienter</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Layout principal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex justify-center bg-gris-50">
    <div className="w-full max-w-md flex flex-col min-h-screen bg-gris-50">
      {popup && (
        <Toast manque={popup.manque} onClose={() => setPopup(null)} />
      )}
      {/* ── STEPPER FIXE ── */}
      <div className="flex-shrink-0 bg-white border-b border-gris-100 sticky top-0 z-10">
        <div className="px-4">
          <DotsStep etape={etape} />
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ÉTAPE 1 — Identification */}
        {etape === 1 && (
          <div className="flex flex-col">
            {/* Hero événement */}
            <div className="px-4 pt-6 pb-5" style={{ background: '#016030' }}>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Événement à évaluer</p>
              <p className="text-white text-2xl font-black mb-3">{getTypeName(evenement.type_id)}</p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Calendar size={12} />{formatDate(evenement.date)}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <MapPin size={12} />{evenement.lieu}
                </span>
              </div>
            </div>

            {/* Kourel — chevauche le hero */}
            <div className="mx-4 -mt-3 bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
                <Users size={16} style={{ color: '#3D8B5E' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider">Kourel évalué</p>
                <p className="text-sm font-bold text-gris-950 truncate">{evenement.kourel}</p>
              </div>
            </div>

            {/* Évaluateur */}
            <div className="mx-4 space-y-3">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gris-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
                    style={{ background: '#3D8B5E', color: 'white' }}>
                    {membre.prenom[0]}{membre.nom[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider">Évaluateur</p>
                    <p className="text-sm font-bold text-gris-950">{membre.prenom} {membre.nom}</p>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-gris-500 leading-relaxed">
                    Évaluez chaque section en choisissant une <span className="font-semibold text-gris-700">appréciation</span> et une <span className="font-semibold text-gris-700">note sur 10</span>. Les remarques sont facultatives.
                  </p>
                </div>
              </div>

              {/* Sections — format compact */}
              <div className="flex flex-wrap gap-2 pb-4">
                {SECTIONS.map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gris-100 bg-white"
                    >
                      <Icon size={11} style={{ color: s.color }} />
                      <span className="text-[11px] font-semibold text-gris-600">{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Évaluation section par section */}
        {etape === 2 && (
          <div className="px-4 py-5">
            {/* Progression globale */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gris-600">
                  Section {sectionIdx + 1} sur {SECTIONS.length}
                </span>
                <span className="text-xs font-semibold text-vert-700">
                  {sectionsCompletes}/{SECTIONS.length} complètes
                </span>
              </div>
              <div className="flex gap-1">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSectionIdx(i)}
                    className="flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: sectionComplete(s.id)
                        ? '#16824E'
                        : i === sectionIdx
                        ? '#014421'
                        : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
            </div>

            <SectionCard
              section={SECTIONS[sectionIdx]}
              data={evalData.notes[SECTIONS[sectionIdx].id]}
              onChange={(changes) => updateSection(SECTIONS[sectionIdx].id, changes)}
              index={sectionIdx + 1}
              total={SECTIONS.length}
            />

            {/* Navigation entre sections */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => sectionIdx === 0 ? setEtape(1) : setSectionIdx(i => i - 1)}
                className="flex-1 h-12 rounded-2xl border-2 border-gris-200 flex items-center justify-center gap-2 text-sm font-bold text-gris-700 transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Préc.
              </button>
              {sectionIdx < SECTIONS.length - 1 ? (
                <button
                  onClick={() => validerEtAvancer(() => setSectionIdx(i => i + 1))}
                  className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: '#016030' }}
                >
                  Suiv. <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={validerEtFinaliser}
                  className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: '#016030' }}
                >
                  Finaliser <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Finalisation */}
        {etape === 3 && (
          <div className="px-4 py-5 space-y-4">
            {/* Récap sections */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-4">Récapitulatif</p>
              <div className="space-y-3">
                {SECTIONS.map(s => {
                  const n = evalData.notes[s.id]
                  const Icon = s.icon
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gris-50 last:border-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: s.bg }}>
                        <Icon size={14} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gris-700 truncate">{s.label}</p>
                        {n.appreciation && (
                          <p className="text-[11px] text-gris-500">{n.appreciation}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {n.note != null ? (
                          <span className="text-sm font-black text-vert-700">{n.note}/10</span>
                        ) : (
                          <span className="text-xs text-gris-400">—</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {getMoyenne() && (
                <div className="mt-4 pt-3 border-t border-gris-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gris-700">Moyenne des sections</span>
                  <span className="text-xl font-black text-vert-700">{getMoyenne()}/10</span>
                </div>
              )}
            </div>

            {/* Appréciation & note générale — non modifiables */}
            {getMoyenne() && (() => {
              const moy = parseFloat(getMoyenne())
              const apprecGen = getAppreciationFromNote(moy)
              const apprecObj = APPRECIATIONS.find(a => a.value === apprecGen)
              return (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-4">
                    Bilan général
                    <span className="ml-2 font-normal normal-case text-gris-400"></span>
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Note circulaire */}
                    <div
                      className="w-20 h-20 rounded-full flex-shrink-0 flex flex-col items-center justify-center border-4"
                      style={{ borderColor: apprecObj?.active ?? '#9CA3AF', background: (apprecObj?.active ?? '#9CA3AF') + '18' }}
                    >
                      <span className="text-2xl font-black leading-none" style={{ color: apprecObj?.active ?? '#9CA3AF' }}>
                        {getMoyenne()}
                      </span>
                      <span className="text-[10px] text-gris-400">/10</span>
                    </div>
                    {/* Appréciation */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gris-400 uppercase tracking-widest mb-1">Appréciation</p>
                      <span
                        className="inline-block px-3 py-1.5 rounded-xl text-sm font-bold"
                        style={{ background: apprecObj?.bg ?? '#F3F4F6', color: apprecObj?.active ?? '#6B7280' }}
                      >
                        {apprecGen || '—'}
                      </span>
                      <p className="text-[11px] text-gris-400 mt-2 leading-relaxed">
                        Moyenne des {SECTIONS.length} sections évaluées.
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Commentaire */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-3">
                Commentaire général <span className="font-normal normal-case text-gris-400">(optionnel)</span>
              </p>
              <textarea
                value={evalData.commentaire}
                onChange={e => setEvalData(prev => ({ ...prev, commentaire: e.target.value }))}
                rows={4}
                placeholder="Votre appréciation globale de l'événement…"
                className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none placeholder:text-gris-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── NAVIGATION FIXE EN BAS ── */}
      <div className="flex-shrink-0 bg-white border-t border-gris-100 px-4 py-3 sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {etape === 1 && (
          <button
            onClick={() => setEtape(2)}
            className="w-full h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
            style={{ background: '#016030' }}
          >
            Commencer l'évaluation <ChevronRight size={16} />
          </button>
        )}


        {etape === 3 && (
          <div className="flex gap-3">
            <button
              onClick={() => setEtape(2)}
              className="flex-none h-13 py-3.5 px-5 rounded-2xl font-bold text-gris-700 border-2 border-gris-200 flex items-center justify-center gap-1 text-sm transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={soumettre}
              disabled={saving}
              className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-40 transition-all active:scale-95"
              style={{ background: '#016030' }}
            >
              <CheckCircle2 size={16} />
              Soumettre l'évaluation
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
