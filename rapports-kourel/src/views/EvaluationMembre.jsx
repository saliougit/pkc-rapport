import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, CheckCircle2, Clock,
  Calendar, MapPin, Users, Music, FileText,
  ArrowLeft, ArrowRight, AlertCircle, Star, Loader,
  Plus, X, GripVertical, ListOrdered, Pencil, Check,
} from 'lucide-react'
import { fetchCriteres, getOrCreateEvaluation, saveEvaluationNote, soumettreEvaluation, validerCodeAcces, saveEvaluationProgramme, saveEvaluationProgrammeNote } from '@/lib/supabase'

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
  if (note >= 9.5) return 'Excellent'
  if (note >= 8)   return 'Très bien'
  if (note >= 6)   return 'Bien'
  if (note >= 4.5) return 'Passable'
  if (note >= 2.5) return 'Médiocre'
  return 'Mauvais'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const sectionVide = () => ({ appreciation: '', note: null, remarques: '', nombre_present: null, nombre_retards: 0 })

function calcPresence(present, retards, effectif) {
  const p = present || 0
  const r = retards || 0
  if (p <= 0 || !effectif || effectif <= 0) return { appreciation: 'Mauvais', note: 1 }
  const ratio = Math.min(p / effectif, 1)
  const retardPenalty = r > 0 ? r * 0.3 : 0
  let raw = 0
  if (ratio >= 0.9) raw = 10
  else if (ratio >= 0.75) raw = 8.5
  else if (ratio >= 0.6) raw = 7
  else if (ratio >= 0.4) raw = 5
  else if (ratio >= 0.2) raw = 3
  else raw = 1
  const finalNote = Math.max(0, Math.round((raw - retardPenalty) * 10) / 10)
  return { appreciation: getAppreciationFromNote(finalNote) || 'Mauvais', note: finalNote }
}

// ─── NoteSelector ─────────────────────────────────────────────────────────────

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

// ─── Mini NoteSelector for per-khassida ───────────────────────────────────────

function MiniNoteSelector({ value, onChange }) {
  const noteColor = value == null ? '#9CA3AF'
    : value < 4 ? '#EF4444'
    : value < 6 ? '#F97316'
    : value < 8 ? '#EAB308'
    : '#16824E'

  const dec = () => onChange(Math.max(0, (value ?? 0) - 0.5))
  const inc = () => onChange(Math.min(10, (value ?? 0) + 0.5))

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={dec} disabled={!value || value <= 0}
        className="w-8 h-8 rounded-full border border-gris-200 flex items-center justify-center text-sm font-bold text-gris-500 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">−</button>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border-3"
          style={{ borderColor: noteColor, background: value ? noteColor + '15' : '#F9FAFB' }}>
          <span className="text-base font-black leading-none" style={{ color: noteColor }}>
            {value != null ? value : '—'}
          </span>
        </div>
      </div>
      <button type="button" onClick={inc} disabled={value >= 10}
        className="w-8 h-8 rounded-full border border-gris-200 flex items-center justify-center text-sm font-bold text-gris-500 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">+</button>
    </div>
  )
}

// ─── Accordéon khassidas ─────────────────────────────────────────────────────

function KhassidaAccordion({ programme, programmeNotes, section, onProgrammeNoteChange, data, onChange }) {
  const [openIdx, setOpenIdx] = useState(0)

  const vals = programme.map(item => programmeNotes?.[item.tempId || item.id]?.[section.critereId]?.note).filter(v => v != null)
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  const avgColor = !avg ? '#9CA3AF' : avg < 4 ? '#EF4444' : avg < 6 ? '#F97316' : avg < 8 ? '#EAB308' : '#16824E'

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gris-500 uppercase tracking-widest text-center mb-1">
        Évaluez chaque khassida
      </p>

      {programme.map((item, idx) => {
        const pn = programmeNotes?.[item.tempId || item.id]?.[section.critereId] || {}
        const isOpen = openIdx === idx
        const done = pn.note != null
        const noteColor = !done ? '#9CA3AF'
          : pn.note < 4 ? '#EF4444'
          : pn.note < 6 ? '#F97316'
          : pn.note < 8 ? '#EAB308'
          : '#16824E'

        return (
          <div key={item.tempId || item.id}
            className="bg-white rounded-2xl border overflow-hidden transition-all"
            style={{ borderColor: isOpen ? '#016030' : done ? '#BBF7D0' : '#E5E7EB' }}>

            {/* En-tête cliquable */}
            <button type="button"
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                style={{ background: done ? '#016030' : '#F3F4F6', color: done ? 'white' : '#9CA3AF' }}>
                {done ? <Check size={11} /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gris-800 truncate">{item.nom}</p>
                {item.melodie && <p className="text-[11px] text-gris-400 truncate">{item.melodie}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {done ? (
                  <span className="text-sm font-black" style={{ color: noteColor }}>{pn.note}/10</span>
                ) : (
                  <span className="text-[11px] text-gris-300 font-medium">—</span>
                )}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                  className="transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </button>

            {/* Corps déplié */}
            {isOpen && (() => {
              const noteExtreme = pn.note != null && (pn.note <= 5 || pn.note >= 9)
              const doitJustifier = noteExtreme && !pn.remarques?.trim()
              return (
                <div className="px-4 pb-4 space-y-3 border-t border-gris-100">
                  <div className="flex justify-center pt-3">
                    <MiniNoteSelector
                      value={pn.note}
                      onChange={v => onProgrammeNoteChange?.(item.tempId || item.id, { note: v, appreciation: getAppreciationFromNote(v) })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {APPRECIATIONS.map(a => {
                      const sel = pn.appreciation === a.value
                      return (
                        <button key={a.value} type="button"
                          onClick={() => onProgrammeNoteChange?.(item.tempId || item.id, { appreciation: a.value, note: a.mid })}
                          className="py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all active:scale-95"
                          style={{ borderColor: sel ? a.active : '#E5E7EB', background: sel ? a.active : 'white', color: sel ? 'white' : a.color }}>
                          {a.label}
                        </button>
                      )
                    })}
                  </div>
                  {noteExtreme && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: doitJustifier ? '#EF4444' : '#6B7280' }}>
                        Justification <span style={{ color: '#EF4444' }}>*obligatoire</span>
                      </p>
                      <textarea
                        value={pn.remarques || ''}
                        onChange={e => onProgrammeNoteChange?.(item.tempId || item.id, { remarques: e.target.value })}
                        rows={2}
                        placeholder="Justifiez cette note critique…"
                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none resize-none placeholder:text-gris-300 ${doitJustifier ? 'border-rouge focus:border-rouge' : 'border-gris-200 focus:border-vert-700'}`}
                      />
                      {doitJustifier && (
                        <p className="text-[10px] text-rouge font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> Obligatoire avant de continuer
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )
      })}

      {avg && (() => {
        const apprecVal = getAppreciationFromNote(parseFloat(avg))
        const apprecObj = APPRECIATIONS.find(a => a.value === apprecVal)
        return (
          <div className="bg-white rounded-2xl border border-vert-200 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gris-600">Moyenne de la section</span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black" style={{ color: avgColor }}>{avg}</span>
                <span className="text-[10px] text-gris-400">/10</span>
              </div>
            </div>
            {apprecObj && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gris-500">Appréciation</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: apprecObj.bg, color: apprecObj.active }}>
                  {apprecObj.label}
                </span>
              </div>
            )}
          </div>
        )
      })()}

      <div>
        <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-2">
          Remarques générales <span className="font-normal normal-case text-gris-400">(optionnel)</span>
        </p>
        <textarea
          value={data?.remarques || ''}
          onChange={e => onChange?.({ remarques: e.target.value })}
          rows={3}
          placeholder="Observations générales sur cette section…"
          className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none bg-white placeholder:text-gris-400"
        />
      </div>
    </div>
  )
}

// ─── Carte section ──────────────────────────────────────────────────────────

function SectionCard({ section, data, onChange, index, total, readOnly, isGenerale, moyenneAuto, isPresence, presenceEffectif, isPerKhassida, programme, programmeNotes, onProgrammeNoteChange }) {
  const Icon = section.icon
  const donePct = Math.round(((index) / total) * 100)
  const noteColor = !moyenneAuto ? '#9CA3AF'
    : moyenneAuto < 4 ? '#EF4444'
    : moyenneAuto < 6 ? '#F97316'
    : moyenneAuto < 8 ? '#EAB308'
    : '#16824E'

  const presenceRatio = data?.nombre_present != null && presenceEffectif > 0
    ? data.nombre_present / presenceEffectif
    : 0
  const presenceColor = data?.nombre_present == null ? '#9CA3AF'
    : presenceRatio >= 0.9 ? '#16824E'
    : presenceRatio >= 0.75 ? '#16824E'
    : presenceRatio >= 0.6 ? '#22C55E'
    : presenceRatio >= 0.4 ? '#EAB308'
    : presenceRatio >= 0.2 ? '#F97316'
    : '#EF4444'

  const noteExtreme = data?.note != null && (data.note <= 5 || data.note >= 9)
  const doitJustifier = noteExtreme && !data?.remarques?.trim()

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl overflow-hidden" style={{ background: section.bg, border: `1.5px solid ${section.color}22` }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: section.color }}>
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
          <div className="h-1 transition-all duration-500" style={{ width: `${donePct}%`, background: 'white' }} />
        </div>
      </div>

      {isPresence ? (
        <div className="bg-gris-50 rounded-2xl px-5 py-5 space-y-4">
          <div className="flex items-center justify-between bg-vert-50 border border-vert-200 rounded-xl px-4 py-3">
            <span className="text-xs font-semibold text-gris-600">Effectif actif</span>
            <span className="text-lg font-black text-vert-700">{presenceEffectif}</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest">Nombre de présents</p>
            {readOnly ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                    style={{ borderColor: presenceColor, background: data.nombre_present ? presenceColor + '15' : '#F9FAFB' }}>
                    <span className="text-2xl font-black leading-none" style={{ color: presenceColor }}>
                      {data.nombre_present != null ? data.nombre_present : '—'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gris-400 mt-1">/{presenceEffectif}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-5">
                  <button type="button"
                    onClick={() => onChange({ nombre_present: Math.max(0, (data.nombre_present ?? 0) - 1) })}
                    disabled={!data.nombre_present || data.nombre_present <= 0}
                    className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">−</button>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300"
                      style={{ borderColor: presenceColor, background: data.nombre_present ? presenceColor + '15' : '#F9FAFB' }}>
                      <span className="text-2xl font-black leading-none" style={{ color: presenceColor }}>
                        {data.nombre_present != null ? data.nombre_present : '—'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gris-400 mt-1">/{presenceEffectif}</span>
                  </div>
                  <button type="button"
                    onClick={() => onChange({ nombre_present: Math.min(presenceEffectif, (data.nombre_present ?? 0) + 1) })}
                    disabled={data.nombre_present >= presenceEffectif}
                    className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">+</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest">Nombre de retards</p>
            {readOnly ? (
              <div className="w-16 h-16 rounded-full border-4 border-amber-300 flex items-center justify-center bg-amber-50">
                <span className="text-xl font-black text-amber-600">{data.nombre_retards ?? 0}</span>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <button type="button"
                  onClick={() => onChange({ nombre_retards: Math.max(0, (data.nombre_retards ?? 0) - 1) })}
                  disabled={!data.nombre_retards || data.nombre_retards <= 0}
                  className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">−</button>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-amber-300 transition-all duration-300"
                    style={{ background: data.nombre_retards ? '#FFFBEB' : '#F9FAFB' }}>
                    <span className="text-xl font-black leading-none text-amber-600">
                      {data.nombre_retards != null ? data.nombre_retards : '—'}
                    </span>
                  </div>
                </div>
                <button type="button"
                  onClick={() => onChange({ nombre_retards: Math.min(presenceEffectif, (data.nombre_retards ?? 0) + 1) })}
                  className="w-12 h-12 rounded-full border-2 border-gris-200 flex items-center justify-center text-xl font-bold text-gris-600 disabled:opacity-30 hover:border-gris-400 active:scale-95 transition-all">+</button>
              </div>
            )}
          </div>

          {data.nombre_present != null && (
            <div className="flex items-center justify-between bg-rouge-bg border border-rouge/20 rounded-xl px-4 py-2">
              <span className="text-xs font-semibold text-gris-600">Absents</span>
              <span className="text-lg font-black text-rouge">{Math.max(0, presenceEffectif - data.nombre_present)}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gris-200 p-4">
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3 text-center">Appréciation</p>
            <div className="flex items-end justify-between gap-1">
              {APPRECIATIONS.map(a => {
                const sel = data.appreciation === a.value
                return (
                  <div key={a.value} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={sel
                        ? { borderColor: a.active, background: a.active, color: 'white' }
                        : { borderColor: '#E5E7EB', color: '#D1D5DB' }}>
                      {a.label[0]}
                    </div>
                    <span className="text-[8px] font-semibold text-center leading-tight"
                      style={{ color: sel ? a.active : '#D1D5DB' }}>
                      {a.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {data.note != null && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs text-gris-400">Note</span>
                <span className="text-xl font-black text-vert-700">{data.note}</span>
                <span className="text-xs text-gris-400">/10</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-2">
              Remarques <span className="font-normal normal-case text-gris-400">(optionnel)</span>
            </p>
            <textarea
              value={data.remarques}
              onChange={e => onChange({ remarques: e.target.value })}
              rows={3}
              placeholder="Vos observations sur la présence…"
              disabled={readOnly}
              className="w-full px-4 py-3 text-sm border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none resize-none bg-white placeholder:text-gris-400 disabled:bg-gris-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      ) : isPerKhassida && programme?.length > 0 ? (
        <KhassidaAccordion
          programme={programme}
          programmeNotes={programmeNotes}
          section={section}
          onProgrammeNoteChange={onProgrammeNoteChange}
          data={data}
          onChange={onChange}
        />
      ) : isGenerale ? (
        <div className="bg-gris-50 rounded-2xl px-5 py-5 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-4"
              style={{ borderColor: noteColor, background: moyenneAuto ? noteColor + '15' : '#F9FAFB' }}>
              <span className="text-3xl font-black leading-none" style={{ color: noteColor }}>
                {moyenneAuto != null ? Number(moyenneAuto).toFixed(1) : '—'}
              </span>
            </div>
            <span className="text-[10px] text-gris-400 mt-1">/10</span>
          </div>
          {moyenneAuto != null && (
            <div className="w-full bg-gris-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(moyenneAuto / 10) * 100}%`, background: noteColor }} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">Appréciation</p>
            <div className="grid grid-cols-3 gap-2">
              {APPRECIATIONS.map(a => {
                const sel = data.appreciation === a.value
                if (readOnly) {
                  return sel ? (
                    <div key={a.value} className="py-3 px-2 rounded-xl text-sm font-semibold border-2 text-center"
                      style={{ borderColor: a.active, background: a.active, color: 'white' }}>{a.label}</div>
                  ) : null
                }
                return (
                  <button key={a.value} type="button"
                    onClick={() => onChange({ appreciation: a.value, note: a.mid })}
                    className="py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 active:scale-95"
                    style={{ borderColor: sel ? a.active : '#E5E7EB', background: sel ? a.active : 'white', color: sel ? 'white' : a.color }}>
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gris-500 uppercase tracking-widest mb-3">Note</p>
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
              Remarques
              {noteExtreme ? (
                <span className="font-bold normal-case text-rouge ml-1">(obligatoire - note critique)</span>
              ) : (
                <span className="font-normal normal-case text-gris-400">(optionnel)</span>
              )}
            </p>
            <textarea
              value={data.remarques}
              onChange={e => onChange({ remarques: e.target.value })}
              rows={3}
              placeholder={noteExtreme ? "Veuillez justifier cette note critique…" : "Vos observations sur cette section…"}
              disabled={readOnly}
              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none resize-none bg-white placeholder:text-gris-400 disabled:bg-gris-50 disabled:cursor-not-allowed ${
                doitJustifier ? 'border-rouge focus:border-rouge' : 'border-gris-200 focus:border-vert-700'
              }`}
            />
            {doitJustifier && (
              <p className="text-[11px] text-rouge font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> Cette note nécessite une justification
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Toast validation ─────────────────────────────────────────────────────────

function Toast({ manque, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const msg = manque.includes('nombre_present')
    ? 'Indiquez le nombre de présents'
    : manque.includes('remarques')
    ? 'Veuillez justifier cette note critique'
    : manque.includes('appreciation') && manque.includes('note')
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
  const steps = ['Ident.', 'Programme', 'Évaluation', 'Finalisation']
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {steps.map((s, i) => {
        const n = i + 1
        const done = n < etape
        const actif = n === etape
        return (
          <div key={s} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className="rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: actif ? 28 : 20,
                  height: actif ? 28 : 20,
                  background: done ? '#16824E' : actif ? '#014421' : '#E5E7EB',
                }}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[9px] font-bold" style={{ color: actif ? 'white' : '#9CA3AF' }}>{n}</span>
                )}
              </div>
              <span className="text-[8px] font-semibold" style={{ color: done ? '#16824E' : actif ? '#014421' : '#9CA3AF' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-5 h-0.5 rounded mb-3" style={{ background: done ? '#16824E' : '#E5E7EB' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Programme Item Row ────────────────────────────────────────────────────────

function ProgrammeRow({ item, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, onDragStart, onDragOver, onDrop, isDragging }) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="bg-white rounded-xl border p-3 transition-all"
      draggable={!editing}
      onDragStart={!editing ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => {}}
      style={{ opacity: isDragging ? 0.5 : 1, borderColor: isDragging ? '#16824E' : editing ? '#016030' : '#E5E7EB' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <GripVertical size={16} className={`flex-shrink-0 ${editing ? 'text-gris-200' : 'text-gris-300 cursor-grab'}`} />
        <span className="text-[10px] font-mono text-gris-400 flex-shrink-0">#{index + 1}</span>

        {editing ? (
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <input
              autoFocus
              value={item.nom}
              onChange={e => onChange({ ...item, nom: e.target.value })}
              placeholder="Nom du khassida"
              className="w-full text-sm font-semibold text-gris-800 bg-gris-50 rounded-lg px-2.5 py-1.5 border border-vert-700 focus:outline-none placeholder:text-gris-300"
            />
            <input
              value={item.melodie}
              onChange={e => onChange({ ...item, melodie: e.target.value })}
              placeholder="Mélodie (optionnel)"
              className="w-full text-xs text-gris-600 bg-gris-50 rounded-lg px-2.5 py-1.5 border border-gris-200 focus:border-vert-700 focus:outline-none placeholder:text-gris-300"
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gris-800 truncate">{item.nom}</p>
            {item.melodie
              ? <p className="text-[11px] text-gris-400 truncate">{item.melodie}</p>
              : <p className="text-[11px] text-gris-300 italic">Aucune mélodie</p>
            }
          </div>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {!editing && (
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={onMoveUp} disabled={isFirst}
                className="w-6 h-5 flex items-center justify-center text-gris-400 hover:text-gris-700 disabled:opacity-20">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <button type="button" onClick={onMoveDown} disabled={isLast}
                className="w-6 h-5 flex items-center justify-center text-gris-400 hover:text-gris-700 disabled:opacity-20">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}

          {editing ? (
            <button type="button" onClick={() => setEditing(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-vert-700 text-white hover:bg-vert-800 transition-colors">
              <Check size={13} />
            </button>
          ) : (
            <button type="button" onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gris-400 hover:text-vert-700 hover:bg-vert-50 transition-colors">
              <Pencil size={13} />
            </button>
          )}

          <button type="button" onClick={onRemove}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gris-400 hover:text-rouge hover:bg-rouge/5 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
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

  const sectionMelodieId = SECTIONS.find(s =>
    s.label.toLowerCase().includes('mélodie') || s.label.toLowerCase().includes('melodie')
  )?.id
  const sectionHouroufId = SECTIONS.find(s =>
    s.label.toLowerCase().includes('hourouf')
  )?.id
  const sectionGeneraleId = SECTIONS.find(s =>
    s.label.toLowerCase().includes('générale') || s.label.toLowerCase().includes('generale')
  )?.id
  const sectionPresenceId = SECTIONS.find(s =>
    s.label.toLowerCase().includes('présence') || s.label.toLowerCase().includes('presence')
  )?.id

  const isPerKhassidaSection = (sectionId) => sectionId === sectionMelodieId || sectionId === sectionHouroufId

  const [evalData, setEvalData] = useState(() => {
    const notes = {}
    return { notes, programme: [], programmeNotes: {}, note_finale: null, commentaire: '', soumis: false }
  })

  const [saving, setSaving] = useState(false)
  const [soumis, setSoumis] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [popup, setPopup] = useState(null)
  const [codeError, setCodeError] = useState(false)
  const [loadError, setLoadError] = useState(null)
  
  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [, setDragOverIndex] = useState(null)

  useEffect(() => {
    if (!codeParam) { navigate('/', { replace: true }); return }
    const fetchTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout_criteres')), 15000)
    )
    Promise.race([fetchCriteres(), fetchTimeout])
      .then(data => {
        if (!data?.length) setLoadError('Aucun critère trouvé. Vérifiez la base de données.')
        else setCriteres(data)
      })
      .catch(err => {
        if (err?.message === 'timeout_criteres') {
          setLoadError('Le serveur met trop de temps à répondre. Réessayez dans quelques secondes.')
        } else {
          setLoadError(err?.message || 'Erreur de connexion.')
        }
      })
  }, [])

  useEffect(() => {
    if (!codeParam || criteres.length === 0) return
    const cUpper = codeParam.toUpperCase().trim()

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 10000)
    )

    Promise.race([validerCodeAcces(cUpper), timeout])
      .then(data => {
        if (data) {
          setCodeValide(data)
          setEtape(1)
        } else {
          setCodeError(true)
        }
      })
      .catch(err => {
        console.error('[EVAL] validerCodeAcces ERROR', err)
        if (err?.message === 'timeout') {
          setLoadError('Timeout : la vérification du code prend trop de temps.')
        } else {
          setCodeError(true)
        }
      })
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
        const ro = alreadySubmitted || eventClosed
        setReadOnly(ro)
        if (ro) setEtape(4)
        if (ev.notes?.length) {
          const loaded = {}
          SECTIONS.forEach(s => {
            const found = ev.notes.find(n => n.critere_id === s.critereId)
            loaded[s.id] = found
              ? { appreciation: found.appreciation || '', note: found.note, remarques: found.remarques || '', nombre_present: found.nombre_present, nombre_retards: found.nombre_retards ?? 0 }
              : sectionVide()
          })
          setEvalData(prev => ({ ...prev, notes: loaded, commentaire: ev.commentaire || '' }))
        }
        if (ev.programme?.length) {
          const prog = ev.programme.map(p => ({ ...p, tempId: p.id }))
          const pn = {}
          prog.forEach(p => {
            const pNotes = {}
            if (p.notes?.length) {
              p.notes.forEach(n => {
                pNotes[n.critere_id] = { note: n.note, appreciation: n.appreciation || '', remarques: n.remarques || '' }
              })
            }
            pn[p.tempId] = pNotes
          })
          setEvalData(prev => ({ ...prev, programme: prog, programmeNotes: pn }))
        }
      })
      .catch(console.error)
  }, [codeValide, SECTIONS.length])

  const updateSection = (sectionId, changes) => {
    setEvalData(prev => {
      const updated = { ...(prev.notes[sectionId] || sectionVide()), ...changes }
      if (changes.nombre_present !== undefined || changes.nombre_retards !== undefined) {
        const effectif = codeValide?.evenement_kourel?.kourel?.effectif_actif || 0
        const auto = calcPresence(changes.nombre_present ?? updated.nombre_present, changes.nombre_retards ?? updated.nombre_retards, effectif)
        updated.appreciation = auto.appreciation
        updated.note = auto.note
      }
      return {
        ...prev,
        notes: { ...prev.notes, [sectionId]: updated },
      }
    })
  }

  const updateProgrammeNote = (itemId, critereId, changes) => {
    setEvalData(prev => {
      const itemNotes = { ...(prev.programmeNotes[itemId]?.[critereId] || {}), ...changes }
      return {
        ...prev,
        programmeNotes: {
          ...prev.programmeNotes,
          [itemId]: { ...(prev.programmeNotes[itemId] || {}), [critereId]: itemNotes },
        },
      }
    })
  }

  const getMoyenne = () => {
    const vals = SECTIONS.map(s => evalData.notes[s.id]?.note).filter(v => v != null)
    if (!vals.length) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const getPerKhassidaMoyenne = (sectionId) => {
    const items = evalData.programme
    if (!items.length) return null
    const vals = items.map(item => evalData.programmeNotes?.[item.tempId || item.id]?.[sectionId]?.note).filter(v => v != null)
    if (!vals.length) return null
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
  }

  const hasExtremeNote = (id) => {
    const n = evalData.notes[id]?.note
    return n != null && (n <= 5 || n >= 9) && !evalData.notes[id]?.remarques?.trim()
  }

  const sectionComplete = (id) => {
    if (id === sectionGeneraleId) return true
    if (id === sectionPresenceId) {
      return evalData.notes[id]?.nombre_present != null
    }
    if (isPerKhassidaSection(id)) {
      const items = evalData.programme
      if (!items.length) return false
      return items.every(item => {
        const n = evalData.programmeNotes?.[item.tempId || item.id]?.[id]
        if (n?.note == null) return false
        if ((n.note <= 5 || n.note >= 9) && !n.remarques?.trim()) return false
        return true
      })
    }
    const n = evalData.notes[id]
    if (!n?.appreciation || n.note == null) return false
    if (n.note != null && (n.note <= 5 || n.note >= 9) && !n.remarques?.trim()) return false
    return true
  }

  const sectionsCompletes = SECTIONS.filter(s => sectionComplete(s.id)).length

  const validerEtAvancer = (cible) => {
    const section = SECTIONS[sectionIdx]
    if (section.id === sectionGeneraleId) { cible(); return }
    if (section.id === sectionPresenceId) {
      if (evalData.notes[section.id]?.nombre_present == null) {
        setPopup({ sectionLabel: section.label, manque: ['nombre_present'] })
        return
      }
      cible(); return
    }
    if (isPerKhassidaSection(section.id)) {
      const items = evalData.programme
      if (!items.length) { setPopup({ sectionLabel: section.label, manque: ['programme'] }); return }
      const missingNote = items.find(item =>
        evalData.programmeNotes?.[item.tempId || item.id]?.[section.id]?.note == null
      )
      if (missingNote) {
        setPopup({ sectionLabel: section.label, manque: ['appreciation'] })
        return
      }
      const missingJustif = items.find(item => {
        const n = evalData.programmeNotes?.[item.tempId || item.id]?.[section.id]
        return n?.note != null && (n.note <= 5 || n.note >= 9) && !n.remarques?.trim()
      })
      if (missingJustif) {
        setPopup({ sectionLabel: section.label, manque: ['remarques'] })
        return
      }
      cible(); return
    }
    const n = evalData.notes[section.id]
    const manque = []
    if (!n?.appreciation) manque.push('appreciation')
    if (n?.note == null) manque.push('note')
    else if (hasExtremeNote(section.id)) manque.push('remarques')
    if (manque.length > 0) {
      setPopup({ sectionLabel: section.label, manque })
      return
    }
    cible()
  }

  const allerEtape4 = () => {
    if (sectionGeneraleId) {
      const melAvg = sectionMelodieId ? getPerKhassidaMoyenne(sectionMelodieId) : null
      const houAvg = sectionHouroufId ? getPerKhassidaMoyenne(sectionHouroufId) : null
      const perKhassidaAvg = [melAvg, houAvg].filter(v => v != null)
      const normalNotes = SECTIONS
        .filter(s => s.id !== sectionGeneraleId && !isPerKhassidaSection(s.id))
        .map(s => evalData.notes[s.id]?.note)
        .filter(v => v != null)
      const allVals = [...normalNotes, ...perKhassidaAvg]
      const moy = allVals.length ? parseFloat((allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2)) : null
      if (moy != null) updateSection(sectionGeneraleId, { note: moy, appreciation: getAppreciationFromNote(moy) })
    }
    setEtape(4)
  }

  const validerEtFinaliser = () => {
    const premiere = SECTIONS.find(s => s.id !== sectionGeneraleId && !sectionComplete(s.id))
    if (premiere) {
      const n = evalData.notes[premiere.id]
      let manque = []
      if (premiere.id === sectionPresenceId) {
        manque = n?.nombre_present == null ? ['nombre_present'] : []
      } else if (isPerKhassidaSection(premiere.id)) {
        manque = evalData.programme.length === 0 ? ['programme'] : ['appreciation']
      } else {
        if (!n?.appreciation) manque.push('appreciation')
        if (n?.note == null) manque.push('note')
        else if (hasExtremeNote(premiere.id)) manque.push('remarques')
      }
      if (manque.length > 0) {
        setSectionIdx(SECTIONS.indexOf(premiere))
        setEtape(3)
        setPopup({ sectionLabel: premiere.label, manque })
        return
      }
    }
    allerEtape4()
  }

  const soumettre = async () => {
    if (!evaluationId) return
    setSaving(true)
    try {
      for (const section of SECTIONS) {
        const d = evalData.notes[section.id]
        if (d?.appreciation || d?.note != null || d?.remarques || d?.nombre_present != null || d?.nombre_retards) {
          await saveEvaluationNote(evaluationId, section.critereId, d.appreciation, d.note, d.remarques, d.nombre_present, d.nombre_retards)
        }
      }
      if (evalData.programme.length > 0) {
        const progData = evalData.programme.map(item => ({ nom: item.nom, melodie: item.melodie }))
        const savedProgramme = await saveEvaluationProgramme(evaluationId, progData)
        for (const item of evalData.programme) {
          const savedItem = savedProgramme.find((_, idx) => idx === evalData.programme.indexOf(item))
          if (!savedItem) continue
          const notes = evalData.programmeNotes[item.tempId || item.id]
          if (notes) {
            for (const [critereIdStr, n] of Object.entries(notes)) {
              const critereId = Number(critereIdStr)
              if (n?.note != null || n?.appreciation) {
                await saveEvaluationProgrammeNote(savedItem.id, critereId, n.appreciation, n.note, n.remarques)
              }
            }
          }
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
        {loadError ? (
          <div className="text-center px-6 max-w-sm">
            <p className="text-lg font-bold text-rouge mb-2">Erreur de chargement</p>
            <p className="text-sm text-gris-500 mb-4">{loadError}</p>
            <button onClick={() => window.location.reload()} className="text-vert-700 font-semibold underline text-sm">Réessayer</button>
          </div>
        ) : codeError ? (
          <div className="text-center px-6">
            <p className="text-lg font-bold text-gris-700 mb-2">Code invalide</p>
            <p className="text-sm text-gris-500 mb-4">Le code saisi n'est pas reconnu.</p>
            <a href="/" className="text-vert-700 font-semibold underline text-sm">Retour à l'accueil</a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader size={24} className="animate-spin text-vert-700" />
            <p className="text-xs text-gris-400">Connexion en cours…</p>
          </div>
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
                    Vous devez évaluer : <span className="font-semibold text-gris-700">{SECTIONS.map(s => s.label).join(', ')}</span>.
                  </p>
                  <p className="text-xs text-gris-400 mt-1">
                    D'abord, définissez le programme de prestation du kourel, puis évaluez chaque section.
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

        {etape === 2 && (
          <div className="px-4 py-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                  <ListOrdered size={18} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gris-950">Programme de prestation</p>
                  <p className="text-xs text-gris-500">Listez les khassidas présentés, dans l'ordre de passage</p>
                </div>
              </div>

              {evalData.programme.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gris-200 rounded-xl">
                  <Music size={24} className="mx-auto mb-2 text-gris-300" />
                  <p className="text-xs text-gris-400">Aucun khassida ajouté</p>
                  <p className="text-[10px] text-gris-300 mt-1">Saisissez le nom ci-dessous pour commencer</p>
                </div>
              )}

              {evalData.programme.length > 0 && (
                <div className="space-y-2 mb-4">
                  {evalData.programme.map((item, idx) => (
                    <ProgrammeRow
                      key={item.tempId}
                      item={item}
                      index={idx}
                      isDragging={draggedIndex === idx}
                      onChange={(newItem) => {
                        setEvalData(prev => {
                          const prog = [...prev.programme]
                          prog[idx] = newItem
                          return { ...prev, programme: prog }
                        })
                      }}
                      onRemove={() => {
                        setEvalData(prev => ({
                          ...prev,
                          programme: prev.programme.filter((_, i) => i !== idx),
                        }))
                      }}
                      onMoveUp={() => {
                        if (idx === 0) return
                        setEvalData(prev => {
                          const prog = [...prev.programme]
                          ;[prog[idx - 1], prog[idx]] = [prog[idx], prog[idx - 1]]
                          return { ...prev, programme: prog }
                        })
                      }}
                      onMoveDown={() => {
                        if (idx >= evalData.programme.length - 1) return
                        setEvalData(prev => {
                          const prog = [...prev.programme]
                          ;[prog[idx], prog[idx + 1]] = [prog[idx + 1], prog[idx]]
                          return { ...prev, programme: prog }
                        })
                      }}
                      isFirst={idx === 0}
                      isLast={idx === evalData.programme.length - 1}
                      onDragStart={(e) => {
                        setDraggedIndex(idx)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        setDragOverIndex(idx)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (draggedIndex === null || draggedIndex === idx) {
                          setDraggedIndex(null)
                          setDragOverIndex(null)
                          return
                        }
                        setEvalData(prev => {
                          const prog = [...prev.programme]
                          const draggedItem = prog[draggedIndex]
                          prog.splice(draggedIndex, 1)
                          prog.splice(idx, 0, draggedItem)
                          return { ...prev, programme: prog }
                        })
                        setDraggedIndex(null)
                        setDragOverIndex(null)
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="border-t border-gris-100 pt-3 space-y-2">
                <p className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider">Ajouter un khassida</p>
                <input
                  placeholder="Nom du khassida *"
                  className="w-full text-sm px-3 py-2.5 border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none placeholder:text-gris-300"
                  value={evalData._newProgrammeNom || ''}
                  onChange={e => setEvalData(prev => ({ ...prev, _newProgrammeNom: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const nom = (evalData._newProgrammeNom || '').trim()
                      if (!nom) return
                      setEvalData(prev => ({
                        ...prev,
                        programme: [...prev.programme, { tempId: Date.now() + Math.random(), nom, melodie: prev._newProgrammeMelodie?.trim() || '', ordre: prev.programme.length }],
                        _newProgrammeNom: '',
                        _newProgrammeMelodie: '',
                      }))
                    }
                  }}
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Mélodie (optionnel)"
                    className="flex-1 min-w-0 text-sm px-3 py-2.5 border border-gris-200 rounded-xl focus:border-vert-700 focus:outline-none placeholder:text-gris-300"
                    value={evalData._newProgrammeMelodie || ''}
                    onChange={e => setEvalData(prev => ({ ...prev, _newProgrammeMelodie: e.target.value }))}
                  />
                  <button type="button"
                    onClick={() => {
                      const nom = (evalData._newProgrammeNom || '').trim()
                      if (!nom) return
                      setEvalData(prev => ({
                        ...prev,
                        programme: [...prev.programme, { tempId: Date.now() + Math.random(), nom, melodie: prev._newProgrammeMelodie?.trim() || '', ordre: prev.programme.length }],
                        _newProgrammeNom: '',
                        _newProgrammeMelodie: '',
                      }))
                    }}
                    className="w-11 h-11 rounded-xl bg-vert-700 text-white flex items-center justify-center hover:bg-vert-800 transition-colors active:scale-95 flex-shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {etape === 3 && SECTIONS.length > 0 && (
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
                {SECTIONS.filter(s => s.id !== sectionGeneraleId).map((s, i) => (
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

            {(() => {
              const sec = SECTIONS[sectionIdx]
              const isGenerale = sec.id === sectionGeneraleId
              const isPerKhassida = isPerKhassidaSection(sec.id)
              const progMoy = isPerKhassida ? getPerKhassidaMoyenne(sec.critereId) : null

              let moyAuto = null
              if (isGenerale) {
                const melAvg = sectionMelodieId ? getPerKhassidaMoyenne(sectionMelodieId) : null
                const houAvg = sectionHouroufId ? getPerKhassidaMoyenne(sectionHouroufId) : null
                const perKhassidaAvg = [melAvg, houAvg].filter(v => v != null)
                const normalNotes = SECTIONS
                  .filter(s => s.id !== sectionGeneraleId && !isPerKhassidaSection(s.id))
                  .map(s => evalData.notes[s.id]?.note)
                  .filter(v => v != null)
                const allVals = [...normalNotes, ...perKhassidaAvg]
                moyAuto = allVals.length ? parseFloat((allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2)) : null
                const appr = getAppreciationFromNote(moyAuto)
                const cur = evalData.notes[sec.id]
                if (moyAuto != null && cur?.note !== moyAuto) updateSection(sec.id, { note: moyAuto, appreciation: appr })
              }

              if (isPerKhassida && progMoy != null) {
                const appr = getAppreciationFromNote(progMoy)
                const cur = evalData.notes[sec.id]
                if (cur?.note !== progMoy) updateSection(sec.id, { note: progMoy, appreciation: appr })
              }

              return (
                <SectionCard
                  section={sec}
                  data={evalData.notes[sec.id] || sectionVide()}
                  onChange={(changes) => updateSection(sec.id, changes)}
                  index={sectionIdx + 1}
                  total={SECTIONS.length}
                  readOnly={readOnly}
                  isGenerale={isGenerale}
                  moyenneAuto={isPerKhassida ? progMoy : isGenerale ? moyAuto : null}
                  isPresence={sec.id === sectionPresenceId}
                  presenceEffectif={codeValide?.evenement_kourel?.kourel?.effectif_actif ?? 0}
                  isPerKhassida={isPerKhassida}
                  programme={evalData.programme}
                  programmeNotes={evalData.programmeNotes}
                  onProgrammeNoteChange={(itemId, changes) => {
                    updateProgrammeNote(itemId, sec.critereId, changes)
                  }}
                />
              )
            })()}

          </div>
        )}

        {etape === 4 && (
          <div className="px-4 py-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gris-400 uppercase tracking-widest mb-4">Récapitulatif</p>

              {evalData.programme.length > 0 && (
                <div className="mb-4 pb-3 border-b border-gris-100">
                  <p className="text-[10px] font-bold text-gris-500 uppercase tracking-wider mb-2">Programme ({evalData.programme.length} khassidas)</p>
                  <div className="space-y-1">
                    {evalData.programme.map((item, idx) => (
                      <div key={item.tempId || item.id} className="flex items-center gap-2 text-xs">
                        <span className="text-gris-400 font-mono">#{idx + 1}</span>
                        <span className="font-semibold text-gris-700">{item.nom}</span>
                        {item.melodie && <span className="text-gris-500">— {item.melodie}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {SECTIONS.map(s => {
                  const n = evalData.notes[s.id] || sectionVide()
                  const Icon = s.icon
                  const isPerKhassida = isPerKhassidaSection(s.id)
                  const progMoy = isPerKhassida ? getPerKhassidaMoyenne(s.critereId) : null
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gris-50 last:border-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: s.bg }}>
                        <Icon size={14} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gris-700 truncate">{s.label}</p>
                        {s.id === sectionPresenceId && n.nombre_present != null ? (
                          <p className="text-[11px] text-gris-500">
                            {n.nombre_present} présent(s)
                            {n.nombre_retards > 0 ? `, ${n.nombre_retards} retard(s)` : ''}
                            , {Math.max(0, (codeValide?.evenement_kourel?.kourel?.effectif_actif || 0) - n.nombre_present)} absent(s)
                            {n.appreciation ? ` — ${n.appreciation}` : ''}
                          </p>
                        ) : isPerKhassida && progMoy != null ? (
                          <p className="text-[11px] text-gris-500">Moy. {progMoy}/10 — {getAppreciationFromNote(progMoy)}</p>
                        ) : n.appreciation ? (
                          <p className="text-[11px] text-gris-500">{n.appreciation}</p>
                        ) : null}
                      </div>
                      <div className="flex-shrink-0">
                        {n.note != null ? (
                          <span className="text-sm font-black text-vert-700">{n.note}/10</span>
                        ) : isPerKhassida && progMoy != null ? (
                          <span className="text-sm font-black text-vert-700">{progMoy}/10</span>
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
            Définir le programme <ChevronRight size={16} />
          </button>
        )}

        {etape === 2 && !readOnly && (
          <div className="flex gap-3">
            <button
              onClick={() => setEtape(1)}
              className="flex-none h-13 py-3.5 px-5 rounded-2xl font-bold text-gris-700 border-2 border-gris-200 flex items-center justify-center gap-1 text-sm transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                if (evalData.programme.length === 0) {
                  setPopup({ manque: ['programme'] })
                  return
                }
                setEtape(3)
              }}
              className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
              style={{ background: '#016030' }}
            >
              Commencer l'évaluation <ChevronRight size={16} />
            </button>
          </div>
        )}

        {etape === 3 && (
          <div className="flex gap-3">
            <button
              onClick={() => sectionIdx === 0 ? setEtape(2) : setSectionIdx(i => i - 1)}
              className="flex-none h-13 py-3.5 px-5 rounded-2xl font-bold text-gris-700 border-2 border-gris-200 flex items-center justify-center gap-1 text-sm transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            {readOnly ? (
              <button
                onClick={allerEtape4}
                className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                style={{ background: '#6B7280' }}
              >
                Voir le récapitulatif <ChevronRight size={16} />
              </button>
            ) : sectionIdx < SECTIONS.length - 1 ? (
              <button
                onClick={() => validerEtAvancer(() => {
                  const next = SECTIONS[sectionIdx + 1]
                  if (next?.id === sectionGeneraleId) allerEtape4()
                  else setSectionIdx(i => i + 1)
                })}
                className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                style={{ background: '#016030' }}
              >
                Suivant <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={validerEtFinaliser}
                className="flex-1 h-13 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                style={{ background: '#016030' }}
              >
                Finaliser <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {etape === 4 && !readOnly && (
          <div className="flex gap-3">
            <button
              onClick={() => { setEtape(3); setSectionIdx(0) }}
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

        {etape === 4 && readOnly && (
          <a href="/"
            className="flex items-center justify-center gap-2 w-full h-13 py-3.5 rounded-2xl font-bold text-white text-sm transition-all"
            style={{ background: '#6B7280' }}
          >
            Retour à l'accueil
          </a>
        )}
      </div>
    </div>
    </div>
  )
}
