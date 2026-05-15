import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, CheckCircle2, Clock,
  Calendar, MapPin, Users, Music, FileText,
  ArrowLeft, ArrowRight, AlertCircle, Star, Loader,
} from 'lucide-react'
import { fetchCriteres, getOrCreateEvaluation, saveEvaluationNote, soumettreEvaluation } from '@/lib/supabase'

const APPRECIATIONS = [
  { label: 'Mauvais',   value: 'Mauvais',   color: '#ee6161', bg: '#FEF2F2', active: '#EF4444', min: 0,   max: 2,   mid: 1   },
  { label: 'Médiocre',  value: 'Médiocre',  color: '#F97316', bg: '#FFF7ED', active: '#F97316', min: 2.5, max: 4,   mid: 3   },
  { label: 'Passable',  value: 'Passable',  color: '#EAB308', bg: '#FEFCE8', active: '#EAB308', min: 4.5, max: 5.5, mid: 5   },
  { label: 'Bien',      value: 'Bien',      color: '#22C55E', bg: '#F0FDF4', active: '#22C55E', min: 6,   max: 7.5, mid: 7   },
  { label: 'Très bien', value: 'Très bien', color: '#16824E', bg: '#F0FDF4', active: '#16824E', min: 8,   max: 9,   mid: 8.5 },
  { label: 'Excellent', value: 'Excellent', color: '#014421', bg: '#DCFCE7', active: '#014421', min: 9.5, max: 10,  mid: 10  },
]

const SECTION_ICONS = [Music, FileText, Clock, Users, Calendar, Star]
const SECTION_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#16824E']
const SECTION_BGS    = ['#EFF6FF', '#F5F3FF', '#FFFBEB', '#FEF2F2', '#ECFDF5', '#F0FDF4']

function getAppreciationFromNote(note) {
  if (note == null) return ''
  return APPRECIATIONS.find(a => note >= a.min && note <= a.max)?.value ?? ''
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const sectionVide = () => ({ appreciation: '', note: null, remarques: '' })

// ─── Composant NoteSelector ───────────────────────────────────────────────────

function NoteSelector({ value, onChange, readOnly }) {
  const pct = ((value ?? 0) / 10) * 100
  const noteColor = !value ? '#9CA3AF'
    : value < 4 ? '#EF4444'
    : value < 6 ? '#F97316'
    : value < 8 ? '#EAB308'
    : '#16824E'

  if (readOnly) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border-4"
            style={{
              borderColor: noteColor,
              background: value ? noteColor + '15' : '#F9FAFB',
            }}
          >
            <span className="text-2xl font-black leading-none" style={{ color: noteColor }}>
              {value != null ? value : '—'}
            </span>
          </div>
          <span className="text-[10px] text-gris-400 mt-1">/10</span>
        </div>
        <div className="w-full bg-gris-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: noteColor }} />
        </div>
      </div>
    )
  }

  const dec = () => onChange(Math.max(0, (value ?? 0) - 0.5))
  const inc = () => onChange(Math.min(10, (value ?? 0) + 0.5))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-5">
        <button type="button" onClick={dec} disabled={!value || value <= 0}
          className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">−</button>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300"
            style={{ borderColor: noteColor, background: value ? noteColor + '15' : '#F9FAFB' }}>
            <span className="text-2xl font-black leading-none" style={{ color: noteColor }}>
              {value != null ? value : '—'}
            </span>
          </div>
          <span className="text-[10px] text-gris-400 mt-1">/10</span>
        </div>
        <button type="button" onClick={inc} disabled={value >= 10}
          className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">+</button>
      </div>
      <div className="w-full bg-gris-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: noteColor }} />
      </div>
    </div>
  )
}

// ─── Carte section ──────────────────────────────────────────────────────────

function SectionCard({ section, data, onChange, index, total, readOnly }) {
  const Icon = section.icon
  const donePct = Math.round(((index) / total) * 100)

  return (
    <div className="flex flex-col gap-5">
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
        <div className="h-1 bg-white/30">
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${donePct}%`, background: 'white' }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">
          Appréciation
        </p>
        <div className="grid grid-cols-3 gap-2">
          {APPRECIATIONS.map(a => {
            const selected = data.appreciation === a.value
            if (readOnly) {
              return selected ? (
                <div key={a.value} className="py-3 px-2 rounded-xl text-sm font-semibold border-2 text-center"
                  style={{ borderColor: a.active, background: a.active, color: 'white' }}>
                  {a.label}
                </div>
              ) : null
            }
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

      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">
          Note
        </p>
        <div className="bg-gris-50 rounded-2xl py-5 px-4">
          <NoteSelector
            value={data.note}
            onChange={v => onChange({ note: v, appreciation: getAppreciationFromNote(v) })}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-2">
          Remarques <span className="font-normal normal-case text-gris-400">(optionnel)</span>
        </p>
        <textarea
          value={data.remarques}
          onChange={e => onChange({ remarques: e.target.value })}
          rows={3}
          placeholder="Vos observations sur cette section…"
          disabled={readOnly}
          className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none bg-white placeholder:text-gris-400 disabled:bg-gris-50 disabled:cursor-not-allowed"
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

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function EvaluationMembre() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const codeParam = searchParams.get('code') || ''

  const [codeValide, setCodeValide] = useState(null)
  const [etape, setEtape] = useState(1)
  const [sectionIdx, setSectionIdx] = useState(0)
  const [criteres, setCriteres] = useState([])
  const [evaluationId, setEvaluationId] = useState(null)

  const SECTIONS = criteres.map((c, i) => ({
    id: c.id,
    label: c.section_nom,
    icon: SECTION_ICONS[i % SECTION_ICONS.length],
    color: SECTION_COLORS[i % SECTION_COLORS.length],
    bg: SECTION_BGS[i % SECTION_BGS.length],
    critereId: c.id,
  }))

  const [evalData, setEvalData] = useState(() => {
    const notes = {}
    return { notes, note_finale: null, commentaire: '', soumis: false }
  })

  const [saving, setSaving] = useState(false)
  const [soumis, setSoumis] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [popup, setPopup] = useState(null)
  const [codeError, setCodeError] = useState(false)

  useEffect(() => {
    if (!codeParam) { navigate('/', { replace: true }); return }
    fetchCriteres().then(setCriteres).catch(console.error)
  }, [])

  useEffect(() => {
    if (!codeParam || criteres.length === 0) return
    const cUpper = codeParam.toUpperCase().trim()
    if (!cUpper) { navigate('/', { replace: true }); return }
    fetch('/api/valider-code-acces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cUpper }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setCodeValide(json.data)
          setEtape(1)
        } else {
          setCodeError(true)
        }
      })
      .catch(() => setCodeError(true))
  }, [codeParam, criteres.length])

  useEffect(() => {
    if (!codeValide || !SECTIONS.length) return
    const notes = {}
    SECTIONS.forEach(s => { notes[s.id] = sectionVide() })
    setEvalData(prev => ({ ...prev, notes }))

    getOrCreateEvaluation(codeValide.evenement_kourel.evenement.id, codeValide.membre.id)
      .then(ev => {
        setEvaluationId(ev.id)
        const alreadySubmitted = ev.soumis === true
        const eventClosed = codeValide.evenement_kourel?.evenement?.statut === 'terminé'
        setReadOnly(alreadySubmitted || eventClosed)
        if (ev.notes?.length) {
          const loaded = {}
          SECTIONS.forEach(s => {
            const found = ev.notes.find(n => n.critere_id === s.critereId)
            loaded[s.id] = found
              ? { appreciation: found.appreciation || '', note: found.note, remarques: found.remarques || '' }
              : sectionVide()
          })
          setEvalData(prev => ({ ...prev, notes: loaded, commentaire: ev.commentaire || '' }))
        }
      })
      .catch(console.error)
  }, [codeValide, SECTIONS.length])

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
    return n?.appreciation && n.note != null
  }

  const sectionsCompletes = SECTIONS.filter(s => sectionComplete(s.id)).length

  const validerEtAvancer = (cible) => {
    const section = SECTIONS[sectionIdx]
    const n = evalData.notes[section.id]
    const manque = []
    if (!n?.appreciation) manque.push('appreciation')
    if (n?.note == null) manque.push('note')
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
      if (!n?.appreciation) manque.push('appreciation')
      if (n?.note == null) manque.push('note')
      setSectionIdx(SECTIONS.indexOf(premiere))
      setPopup({ sectionLabel: premiere.label, manque })
      return
    }
    setEtape(3)
  }

  const soumettre = async () => {
    if (!evaluationId) return
    setSaving(true)
    try {
      for (const section of SECTIONS) {
        const d = evalData.notes[section.id]
        if (d?.appreciation || d?.note != null || d?.remarques) {
          await saveEvaluationNote(evaluationId, section.critereId, d.appreciation, d.note, d.remarques)
        }
      }
      await soumettreEvaluation(evaluationId, evalData.commentaire)
      setSoumis(true)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la soumission. Réessayez.')
    }
    finally { setSaving(false) }
  }

  if (!codeValide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {codeError ? (
          <div className="text-center px-6">
            <p className="text-lg font-bold text-gris-700 mb-2">Code invalide</p>
            <p className="text-sm text-gris-500 mb-4">Le code saisi n'est pas reconnu.</p>
            <a href="/" className="text-vert-700 font-semibold underline text-sm">Retour à l'accueil</a>
          </div>
        ) : (
          <Loader size={24} className="animate-spin text-vert-700" />
        )}
      </div>
    )
  }

  const evenement = codeValide.evenement_kourel?.evenement
  const kourel = codeValide.evenement_kourel?.kourel
  const membre = codeValide.membre

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
          <div className="relative flex items-center justify-center mx-auto mb-8" style={{ width: 120, height: 120 }}>
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
            <svg viewBox="0 0 100 100" width="120" height="120" fill="none">
              <circle cx="50" cy="50" r="46" fill="#016030"
                style={{ transformOrigin: '50px 50px', animation: 'bgScale 0.55s cubic-bezier(.34,1.56,.64,1) 0.05s both' }} />
              <circle cx="50" cy="50" r="46" stroke="#4ADE80" strokeWidth="2.5" fill="none"
                strokeDasharray="290" strokeDashoffset="290"
                style={{ animation: 'drawCircle 0.55s ease 0.05s both' }} />
              <path d="M 24 52 L 42 70 L 76 30" stroke="white" strokeWidth="6.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="82" strokeDashoffset="82"
                style={{ animation: 'drawCheck 0.38s cubic-bezier(.4,0,.2,1) 0.55s both' }} />
            </svg>
          </div>

          <h2 className="text-3xl font-black text-gris-950 mb-1 anim-up-1" style={{ letterSpacing: '-0.02em' }}>
            Dieureudieuf Dieuwrinn
          </h2>
          <p className="text-sm text-gris-500 anim-up-2">
            {membre.prenom}, votre évaluation a bien été enregistrée.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 anim-up-2">
            <span className="flex items-center gap-1.5 bg-gris-50 text-gris-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gris-100">
              <Calendar size={12} />{evenement.type?.nom || 'Événement'}
            </span>
            <span className="flex items-center gap-1.5 bg-gris-50 text-gris-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gris-100">
              <Clock size={12} />{formatDate(evenement.date_evenement)}
            </span>
          </div>

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

  return (
    <div className="min-h-screen flex justify-center bg-gris-50">
    <div className="w-full max-w-md flex flex-col min-h-screen bg-gris-50">
      {popup && (
        <Toast manque={popup.manque} onClose={() => setPopup(null)} />
      )}
      <div className="flex-shrink-0 bg-white border-b border-gris-100 sticky top-0 z-10">
        <div className="px-4">
          <DotsStep etape={etape} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {etape === 1 && (
          <div className="flex flex-col">
            <div className="px-4 pt-6 pb-5" style={{ background: '#016030' }}>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Événement à évaluer</p>
              <p className="text-white text-2xl font-black mb-3">{evenement.type?.nom || 'Événement'}</p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Calendar size={12} />{formatDate(evenement.date_evenement)}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <MapPin size={12} />{evenement.lieu?.nom || evenement.lieu || '—'}
                </span>
              </div>
            </div>

            <div className="mx-4 -mt-3 bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
                <Users size={16} style={{ color: '#3D8B5E' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider">Kourel évalué</p>
                <p className="text-sm font-bold text-gris-950 truncate">{kourel?.nom || '—'}</p>
              </div>
            </div>

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

        {etape === 2 && SECTIONS.length > 0 && (
          <div className="px-4 py-5">
            {readOnly && (
              <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-800">
                  {codeValide.evenement_kourel?.evenement?.statut === 'terminé'
                    ? "Cet événement est terminé. Vous pouvez consulter votre évaluation mais ne pouvez plus la modifier."
                    : "Votre évaluation a déjà été soumise. Vous pouvez la consulter mais ne pouvez plus la modifier."}
                </p>
              </div>
            )}
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
              data={evalData.notes[SECTIONS[sectionIdx].id] || sectionVide()}
              onChange={(changes) => updateSection(SECTIONS[sectionIdx].id, changes)}
              index={sectionIdx + 1}
              total={SECTIONS.length}
              readOnly={readOnly}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => sectionIdx === 0 ? setEtape(1) : setSectionIdx(i => i - 1)}
                className="flex-1 h-12 rounded-2xl border-2 border-gris-200 flex items-center justify-center gap-2 text-sm font-bold text-gris-700 transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Préc.
              </button>
              {readOnly ? (
                <button
                  onClick={() => setEtape(3)}
                  className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: '#6B7280' }}
                >
                  Voir le récapitulatif <ChevronRight size={16} />
                </button>
              ) : sectionIdx < SECTIONS.length - 1 ? (
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

        {etape === 3 && (
          <div className="px-4 py-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-4">Récapitulatif</p>
              <div className="space-y-3">
                {SECTIONS.map(s => {
                  const n = evalData.notes[s.id] || sectionVide()
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

            {getMoyenne() && (() => {
              const moy = parseFloat(getMoyenne())
              const apprecGen = getAppreciationFromNote(moy)
              const apprecObj = APPRECIATIONS.find(a => a.value === apprecGen)
              return (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-4">
                    Bilan général
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full flex-shrink-0 flex flex-col items-center justify-center border-4"
                      style={{ borderColor: apprecObj?.active ?? '#9CA3AF', background: (apprecObj?.active ?? '#9CA3AF') + '18' }}
                    >
                      <span className="text-2xl font-black leading-none" style={{ color: apprecObj?.active ?? '#9CA3AF' }}>
                        {getMoyenne()}
                      </span>
                      <span className="text-[10px] text-gris-400">/10</span>
                    </div>
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

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-3">
                Commentaire général <span className="font-normal normal-case text-gris-400">(optionnel)</span>
              </p>
              <textarea
                value={evalData.commentaire}
                onChange={e => setEvalData(prev => ({ ...prev, commentaire: e.target.value }))}
                rows={4}
                placeholder="Votre appréciation globale de l'événement…"
                disabled={readOnly}
                className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none placeholder:text-gris-400 disabled:bg-gris-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gris-100 px-4 py-3 sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {etape === 1 && !readOnly && (
          <button
            onClick={() => setEtape(2)}
            disabled={SECTIONS.length === 0}
            className="w-full h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ background: '#016030' }}
          >
            Commencer l'évaluation <ChevronRight size={16} />
          </button>
        )}

        {etape === 3 && !readOnly && (
          <div className="flex gap-3">
            <button
              onClick={() => setEtape(2)}
              className="flex-none h-13 py-3.5 px-5 rounded-2xl font-bold text-gris-700 border-2 border-gris-200 flex items-center justify-center gap-1 text-sm transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button onClick={soumettre} disabled={saving}
              className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-40 transition-all active:scale-95"
              style={{ background: '#016030' }}>
              <CheckCircle2 size={16} /> Soumettre l'évaluation
            </button>
          </div>
        )}

        {etape === 3 && readOnly && (
          <p className="text-center text-xs text-gris-400 font-semibold py-2">
            Évaluation en lecture seule
          </p>
        )}
      </div>
    </div>
    </div>
  )
}
