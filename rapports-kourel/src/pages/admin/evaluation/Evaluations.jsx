import { useState, useMemo, useEffect } from 'react'
import { Calendar, MapPin, ChevronRight, ChevronDown, Users, CheckCircle2, Clock, AlertCircle, Save, Loader, X, Search, SlidersHorizontal, ChevronLeft, ChevronFirst, ChevronLast } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  fetchEvenements, fetchTypesEvenements, fetchLieux, fetchMembres,
  fetchEvalMembres, fetchEvaluations, fetchCriteres, modifierEvenement,
  modifierNoteDefinitive, modifierEvenementKourel,
} from '@/lib/supabase'

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_STYLES = {
  'terminé': 'text-vert-700 bg-vert-50 border-vert-200',
  'en cours': 'text-blue-700 bg-blue-50 border-blue-200',
  'à venir': 'text-amber-700 bg-amber-50 border-amber-200',
}

const APPREC_COLORS = {
  'Mauvais':   { color: '#EF4444', bg: '#FEF2F2' },
  'Médiocre':  { color: '#F97316', bg: '#FFF7ED' },
  'Passable':  { color: '#EAB308', bg: '#FEFCE8' },
  'Bien':      { color: '#22C55E', bg: '#F0FDF4' },
  'Très bien': { color: '#16824E', bg: '#F0FDF4' },
  'Excellent': { color: '#014421', bg: '#DCFCE7' },
}

function getMoyenneGlobale(notesObj) {
  const allNotes = Object.values(notesObj || {}).flatMap(e =>
    Object.values(e.notes || {}).map(n => n.note).filter(v => v != null)
  )
  if (!allNotes.length) return null
  return (allNotes.reduce((a, b) => a + b, 0) / allNotes.length).toFixed(2)
}

function getStatusEval(notes) {
  if (!notes) return { label: 'En attente', class: 'bg-amber-50 text-amber-700' }
  const filled = Object.values(notes.notes || {}).filter(n => n.note != null).length
  const total = Object.keys(notes.notes || {}).length
  if (filled === 0) return { label: 'En attente', class: 'bg-amber-50 text-amber-700' }
  if (filled < total) return { label: 'En cours', class: 'bg-blue-50 text-blue-700' }
  return { label: 'Soumis', class: 'bg-vert-50 text-vert-700' }
}

function noteVersAppreciation(note) {
  if (note == null) return null
  if (note >= 9) return 'Excellent'
  if (note >= 7.5) return 'Très bien'
  if (note >= 6) return 'Bien'
  if (note >= 4) return 'Passable'
  if (note >= 2) return 'Médiocre'
  return 'Mauvais'
}

function getModeAppreciation(notesObj, sectionKey) {
  const apprs = Object.values(notesObj || {})
    .map(n => n.notes?.[sectionKey]?.appreciation)
    .filter(Boolean)
  if (!apprs.length) return null
  const counts = apprs.reduce((acc, a) => ({ ...acc, [a]: (acc[a] || 0) + 1 }), {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function getNoteFinaleAvg(notesObj) {
  const vals = Object.values(notesObj || {}).map(n => n.note_finale).filter(v => v != null)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length)
}

function EventCard({ event, onClick }) {
  const nd = event.kourels?.reduce((acc, k) => k.note_definitive != null ? k.note_definitive : acc, null)
  const rawMoy = nd != null ? Number(nd) : getNoteFinaleAvg(event.notes)
  const moy = rawMoy != null ? Number(rawMoy).toFixed(2) : null
  const apprGen = noteVersAppreciation(rawMoy)
  const soumis = Object.keys(event.notes).length
  const total = event.evaluateurs.length
  const progres = total > 0 ? Math.round((soumis / total) * 100) : 0

  const accent =
    event.statut === 'terminé' ? '#16824E'
    : event.statut === 'en cours' ? '#3B82F6'
    : '#F59E0B'

  const statutPill =
    event.statut === 'terminé'
      ? { color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0' }
      : event.statut === 'en cours'
      ? { color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe' }
      : { color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a' }

  const kourelNom = event.kourels?.map(k => k.kourel?.nom).filter(Boolean).join(', ') || '—'

  return (
    <div
      onClick={() => onClick(event)}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
      style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, borderRadius: '18px 18px 0 0', opacity: 0.9 }} />

      <div
        className="absolute pointer-events-none transition-all duration-500 group-hover:opacity-40 group-hover:scale-150"
        style={{ top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(28px)' }}
      />
      <div
        className="absolute pointer-events-none transition-all duration-700 group-hover:opacity-35 group-hover:scale-150"
        style={{ bottom: -24, left: -24, width: 80, height: 80, borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(22px)' }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3" style={{ paddingTop: 5 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="truncate group-hover:text-vert-700 transition-colors"
            style={{ fontSize: 17, fontWeight: 900, lineHeight: '22px', margin: 0, color: '#09090b' }}>
            {kourelNom}
          </p>
          <p className="truncate" style={{ fontSize: 12, lineHeight: '16px', margin: 0, marginTop: 2, color: '#9ca3af' }}>
            {event.type_nom}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {moy != null ? (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: accent }}>
                {moy}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>/10</span>
            </div>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700, color: '#d1d5db' }}>—</span>
          )}
          <span style={{ ...statutPill, fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '3px 10px', lineHeight: '16px', whiteSpace: 'nowrap' }}>
            {event.statut}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', minWidth: 0, flex: 1 }}>
          <Calendar size={10} style={{ flexShrink: 0 }} />
          <span style={{ flexShrink: 0 }}>{formatDate(event.date_evenement)}</span>
          <span style={{ color: '#d1d5db', flexShrink: 0, margin: '0 1px' }}>·</span>
          <MapPin size={10} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.lieu_nom}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {apprGen && APPREC_COLORS[apprGen] && (
            <span style={{ color: APPREC_COLORS[apprGen].color, background: APPREC_COLORS[apprGen].bg, fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 9px', lineHeight: '15px' }}>
              {apprGen}
            </span>
          )}
          {soumis < total && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 44, height: 5, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{ width: `${progres}%`, height: '100%', borderRadius: 99, background: '#60a5fa', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af' }}>{soumis}/{total}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function EvaluateurPanel({ evaluateur, notes, sections }) {
  const [open, setOpen] = useState(false)
  const status = getStatusEval(notes)
  const noteFinale = notes?.note_finale != null ? Number(notes.note_finale).toFixed(2) : null

  return (
    <div className="rounded-xl border border-gris-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gris-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-vert-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">
              {evaluateur.prenom?.[0]}{evaluateur.nom?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gris-950 truncate">{evaluateur.prenom} {evaluateur.nom}</p>
            <p className="text-[10px] text-gris-500 truncate">{evaluateur.kourel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {noteFinale && (
            <div className="text-right">
              <p className="text-sm font-black text-vert-700 leading-none">{noteFinale}<span className="text-[9px] text-vert-500">/10</span></p>
            </div>
          )}
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${status.class}`}>
            {status.label}
          </span>
          {open ? <ChevronDown size={14} className="text-gris-300 flex-shrink-0" /> : <ChevronRight size={14} className="text-gris-300 flex-shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gris-100 px-4 py-3.5 space-y-2.5">
          {notes ? (
            sections.filter(s => {
              const sec = notes.notes?.[s.key || s.id]
              return sec && (sec.note != null || sec.appreciation || sec.remarques)
            }).length > 0 ? (
              <div className="rounded-lg border border-gris-200 overflow-hidden">
                <div className="grid grid-cols-[1fr_60px_80px] bg-gris-100 px-3.5 py-1.5">
                  <span className="text-[9px] font-bold text-gris-400 uppercase">Critère</span>
                  <span className="text-[9px] font-bold text-gris-400 uppercase text-right">Note</span>
                  <span className="text-[9px] font-bold text-gris-400 uppercase text-right">Appréciation</span>
                </div>
                {sections.map(section => {
                  const s = notes.notes?.[section.key || section.id]
                  if (!s || (s.note == null && !s.appreciation && !s.remarques)) return null
                  const appr = s.appreciation || noteVersAppreciation(s.note)
                  const ac = appr ? APPREC_COLORS[appr] : null
                  return (
                    <div key={section.id} className="border-t border-gris-100">
                      <div className="grid grid-cols-[1fr_60px_80px] items-center px-3.5 py-2 bg-white">
                        <span className="text-xs font-semibold text-gris-800 truncate">{section.label}</span>
                        <span className="text-xs font-black text-gris-900 text-right">
                          {s.note != null
                            ? <>{Number(s.note).toFixed(1)}<span className="text-[9px] text-gris-400">/10</span></>
                            : <span className="text-gris-300">—</span>
                          }
                        </span>
                        <span className="text-right">
                          {appr && ac
                            ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ color: ac.color, background: ac.bg }}>{appr}</span>
                            : <span className="text-[10px] text-gris-300">—</span>
                          }
                        </span>
                      </div>
                      {s.remarques && (
                        <div className="px-3.5 pb-2 bg-gris-50/50">
                          <p className="text-[10px] text-gris-500 italic truncate">"{s.remarques}"</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gris-400 italic text-center py-2">Évaluation en cours, aucune note saisie.</p>
            )
          ) : (
            <p className="text-xs text-gris-400 italic text-center py-2">Évaluation non soumise.</p>
          )}
          {notes?.commentaire && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-3.5 py-2.5">
              <p className="text-[10px] font-bold text-blue-500 mb-0.5">Commentaire</p>
              <p className="text-xs text-gris-700 leading-relaxed italic">"{notes.commentaire}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
        onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        <ChevronFirst size={14} />
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft size={14} />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs font-semibold"
          onClick={() => onPageChange(page)}>
          {page}
        </Button>
      ))}

      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight size={14} />
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
        onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        <ChevronLast size={14} />
      </Button>
    </div>
  )
}

export function EvaluationsPage() {
  const [evenements, setEvenements] = useState([])
  const [types, setTypes] = useState([])
  const [membres, setMembres] = useState([])
  const [criteres, setCriteres] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [conclusion, setConclusion] = useState('')
  const [notesDefinitives, setNotesDefinitives] = useState({})
  const [conclusionsKourel, setConclusionsKourel] = useState({})
  const [noteGlobale, setNoteGlobale] = useState('')
  const [openKourels, setOpenKourels] = useState({})
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterType, setFilterType] = useState('tous')
  const [filterLieu, setFilterLieu] = useState('tous')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(6)

  useEffect(() => { setPage(1) }, [perPage])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [evts, tps, mbrs, crits] = await Promise.all([
        fetchEvenements(), fetchTypesEvenements(), fetchMembres(), fetchCriteres()
      ])

      const enriched = await Promise.all((evts || []).map(async (e) => {
        const allEvalMembres = await fetchEvalMembres(e.id)
        const evals = await fetchEvaluations(e.id)
        const evaluateurs = (allEvalMembres || []).filter(em => em.role === 'evaluateur').map(em => em.membre_id)
        const notes = {}
        ;(evals || []).forEach(ev => {
          const sectionNotes = {}
          ;(ev.notes || []).forEach(n => {
            const key = String(n.critere_id)
            sectionNotes[key] = {
              appreciation: n.appreciation || '',
              note: n.note,
              remarques: n.remarques || '',
            }
          })
          const vals = Object.values(sectionNotes).filter(v => v.note != null)
          notes[ev.membre_id] = {
            notes: sectionNotes,
            note_finale: vals.length ? (vals.reduce((a, b) => a + b.note, 0) / vals.length) : null,
            commentaire: ev.commentaire || '',
            soumis: ev.soumis,
          }
        })
        return {
          ...e,
          type_id: e.type?.id,
          type_nom: e.type?.nom || '—',
          lieu_nom: e.lieu?.nom || '—',
          evaluateurs,
          notes,
        }
      }))
      setEvenements(enriched)
      setTypes(tps || [])
      setMembres(mbrs || [])
      setCriteres(crits || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const SECTIONS = (criteres || []).map(c => ({
    id: c.id,
    key: String(c.id),
    label: c.section_nom,
  }))

  const filtres = useMemo(() => {
    const q = search.toLowerCase().trim()
    return evenements.filter(e => {
      if (q && !e.type_nom.toLowerCase().includes(q) &&
          !(e.kourel?.nom || '').toLowerCase().includes(q) &&
          !e.lieu_nom.toLowerCase().includes(q)) return false
      if (filterStatut !== 'tous' && e.statut !== filterStatut) return false
      if (filterType !== 'tous' && e.type_id !== parseInt(filterType)) return false
      if (filterLieu !== 'tous' && e.lieu_nom !== filterLieu) return false
      if (filterDateStart && new Date(e.date_evenement) < new Date(filterDateStart)) return false
      if (filterDateEnd) {
        const end = new Date(filterDateEnd)
        end.setDate(end.getDate() + 1)
        if (new Date(e.date_evenement) >= end) return false
      }
      return true
    })
  }, [evenements, search, filterStatut, filterType, filterLieu, filterDateStart, filterDateEnd])

  const totalPages = Math.max(1, Math.ceil(filtres.length / perPage))
  const pageCourante = Math.min(page, totalPages)
  const pagines = filtres.slice((pageCourante - 1) * perPage, pageCourante * perPage)

  const ouvrirDetail = (e) => {
    setSelected(e)
    setConclusion(e.conclusion || '')
    setNoteGlobale(e.note_globale != null ? String(e.note_globale) : '')
    const ok = {}
    ;(e.kourels || []).forEach(k => { ok[k.id] = true })
    setOpenKourels(ok)
    const nds = {}
    const ck = {}
    ;(e.kourels || []).forEach(k => {
      if (k.note_definitive != null) nds[k.id] = String(k.note_definitive)
      ck[k.id] = k.conclusion || ''
    })
    setNotesDefinitives(nds)
    setConclusionsKourel(ck)
  }

  const sauvegarderConclusion = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const ng = noteGlobale !== '' ? parseFloat(noteGlobale) : null
      await modifierEvenement(selected.id, { conclusion, note_globale: ng })
      const promesses = (selected.kourels || []).map(k => {
        const nd = notesDefinitives[k.id] !== undefined && notesDefinitives[k.id] !== ''
          ? parseFloat(notesDefinitives[k.id]) : null
        const ck = conclusionsKourel[k.id] ?? ''
        return modifierEvenementKourel(k.id, { note_definitive: nd, conclusion: ck })
      })
      await Promise.all(promesses)
      setEvenements(list => list.map(e => {
        if (e.id !== selected.id) return e
        const kourels = (e.kourels || []).map(k => ({
          ...k,
          note_definitive: notesDefinitives[k.id] !== '' ? parseFloat(notesDefinitives[k.id]) : null,
          conclusion: conclusionsKourel[k.id] ?? k.conclusion,
        }))
        return { ...e, conclusion, note_globale: ng, kourels }
      }))
      setSelected(s => ({
        ...s,
        conclusion,
        note_globale: ng,
        kourels: (s.kourels || []).map(k => ({
          ...k,
          note_definitive: notesDefinitives[k.id] !== '' ? parseFloat(notesDefinitives[k.id]) : null,
          conclusion: conclusionsKourel[k.id] ?? k.conclusion,
        }))
      }))
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const typesList = types || []
  const lieuxList = [...new Set(evenements.map(e => e.lieu_nom).filter(Boolean))]

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité suivi & Évaluation', 'Évaluations']}
        title="Évaluations"
        subtitle={`${evenements.length} événement${evenements.length > 1 ? 's' : ''}`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-400" />
          <Input
            placeholder="Rechercher par type, kourel, lieu…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-gris-400" />
          <Select value={filterStatut} onValueChange={v => { setFilterStatut(v); setPage(1) }}>
            <SelectTrigger className="h-9 text-xs w-32">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="terminé">Terminé</SelectItem>
              <SelectItem value="en cours">En cours</SelectItem>
              <SelectItem value="à venir">À venir</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1) }}>
            <SelectTrigger className="h-9 text-xs w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les types</SelectItem>
              {typesList.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nom}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLieu} onValueChange={v => { setFilterLieu(v); setPage(1) }}>
            <SelectTrigger className="h-9 text-xs w-32">
              <SelectValue placeholder="Lieu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les lieux</SelectItem>
              {lieuxList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>

          <input type="date" value={filterDateStart} onChange={e => { setFilterDateStart(e.target.value); setPage(1) }}
            className="h-9 w-36 text-xs border border-gris-200 rounded-lg px-2 bg-white text-gris-700 focus:outline-none focus:ring-2 focus:ring-vert-500" />
          <span className="text-[10px] text-gris-400">→</span>
          <input type="date" value={filterDateEnd} onChange={e => { setFilterDateEnd(e.target.value); setPage(1) }}
            className="h-9 w-36 text-xs border border-gris-200 rounded-lg px-2 bg-white text-gris-700 focus:outline-none focus:ring-2 focus:ring-vert-500" />
          {(search || filterStatut !== 'tous' || filterType !== 'tous' || filterLieu !== 'tous' || filterDateStart || filterDateEnd) && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-gris-500"
              onClick={() => { setSearch(''); setFilterStatut('tous'); setFilterType('tous'); setFilterLieu('tous'); setFilterDateStart(''); setFilterDateEnd(''); setPage(1) }}>
              <X size={13} className="mr-1" /> Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-16">
            <Loader size={24} className="animate-spin mx-auto text-vert-700" />
          </div>
        ) : pagines.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gris-200 rounded-lg bg-gris-50/50">
            <Search size={36} className="mx-auto mb-3 text-gris-300" />
            <p className="text-sm font-semibold text-gris-700">Aucun résultat</p>
            <p className="text-xs text-gris-500 mt-1">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-xs text-gris-500">
                {filtres.length} résultat{filtres.length > 1 ? 's' : ''}
                {filtres.length !== evenements.length && (
                  <span> (sur {evenements.length})</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start flex-1 overflow-y-auto pb-3">
              {pagines.map(e => (
                <EventCard key={e.id} event={e} onClick={ouvrirDetail} />
              ))}
            </div>

            <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gris-500">Lignes</span>
                <Select value={String(perPage)} onValueChange={v => setPerPage(Number(v))}>
                  <SelectTrigger className="h-7 text-xs w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 6, 9, 12, 18].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Pagination currentPage={pageCourante} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}>
        <SheetContent 
          className="w-full sm:max-w-2xl bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-bold text-gris-950">
                    {selected.type_nom}
                  </SheetTitle>
                  <div className="text-sm text-gris-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(selected.date_evenement)}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} />{selected.lieu_nom}</span>
                    <span className="flex items-center gap-1.5 font-medium text-gris-700"><Users size={13} />{selected.kourels?.map(k => k.kourel?.nom).filter(Boolean).join(', ') || '—'}</span>
                  </div>
                  <div className="mt-3">
                    <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${STATUS_STYLES[selected.statut] || ''}`}>
                      {selected.statut}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {(selected.kourels || []).length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gris-200 rounded-lg bg-gris-50/50">
                    <Users size={28} className="mx-auto mb-2 text-gris-300" />
                    <p className="text-sm text-gris-500">Aucun kourel associé à cet événement</p>
                  </div>
                ) : (
                  (selected.kourels || []).map(k => {
                    const kourelEvalIds = k.evaluateurs || []
                    const kourelNotes = Object.fromEntries(
                      Object.entries(selected.notes).filter(([id]) => kourelEvalIds.includes(parseInt(id)))
                    )
                    const noteFin = getNoteFinaleAvg(kourelNotes)
                    const apprGen = noteVersAppreciation(noteFin)
                    const ac = apprGen ? APPREC_COLORS[apprGen] : null

                    return (
                      <div key={k.id} className="rounded-xl border border-gris-200 overflow-hidden shadow-sm">

                        {/* En-tête kourel cliquable */}
                        <button
                          onClick={() => setOpenKourels(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                          className="w-full px-4 py-3 bg-gris-50 border-b border-gris-200 flex items-center justify-between gap-3 hover:bg-gris-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className={`text-gris-400 transition-transform duration-200 flex-shrink-0 ${openKourels[k.id] ? 'rotate-90' : ''}`} />
                            <p className="text-sm font-bold text-gris-950">{k.kourel?.nom || '—'}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {apprGen && ac && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: ac.color, background: ac.bg }}>
                                {apprGen}
                              </span>
                            )}
                            {noteFin != null ? (
                              <span className="text-base font-black text-vert-700 leading-none">
                                {noteFin.toFixed(2)}<span className="text-[10px] text-vert-500 font-normal">/10</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gris-300 font-bold">—</span>
                            )}
                          </div>
                        </button>

                        {/* Contenu pliable */}
                        {openKourels[k.id] && <div className="p-4 space-y-2">
                          {kourelEvalIds.length === 0 ? (
                            <p className="text-xs text-gris-400 italic text-center py-4">Aucun évaluateur assigné à ce kourel</p>
                          ) : (
                            kourelEvalIds.map(id => {
                              const m = membres.find(x => x.id === id)
                              if (!m) return null
                              return <EvaluateurPanel key={id} evaluateur={m} notes={selected.notes?.[id] || null} sections={SECTIONS} />
                            })
                          )}

                          {/* Synthèse critères pour ce kourel */}
                          {Object.keys(kourelNotes).length > 0 && SECTIONS.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider pt-1 mb-2">Synthèse par critère</p>
                              <div className="rounded-lg border border-gris-200 overflow-hidden">
                                <div className="grid grid-cols-[1fr_60px_80px] bg-gris-100 px-3 py-1.5">
                                  <span className="text-[9px] font-bold text-gris-400 uppercase">Critère</span>
                                  <span className="text-[9px] font-bold text-gris-400 uppercase text-right">Note</span>
                                  <span className="text-[9px] font-bold text-gris-400 uppercase text-right">Appréciation</span>
                                </div>
                                {SECTIONS.map(section => {
                                  const vals = Object.values(kourelNotes).map(n => n.notes?.[section.key]?.note).filter(v => v != null)
                                  const moy = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
                                  const appr = noteVersAppreciation(moy)
                                  const sac = appr ? APPREC_COLORS[appr] : null
                                  return (
                                    <div key={section.id} className="grid grid-cols-[1fr_60px_80px] items-center px-3 py-2 border-t border-gris-100 bg-white">
                                      <span className="text-xs font-medium text-gris-700 truncate">{section.label}</span>
                                      <span className="text-xs font-black text-gris-800 text-right">{moy != null ? `${moy.toFixed(1)}/10` : '—'}</span>
                                      <span className="text-right">
                                        {appr && sac
                                          ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: sac.color, background: sac.bg }}>{appr}</span>
                                          : <span className="text-[10px] text-gris-300">—</span>
                                        }
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Commentaires de ce kourel */}
                          {Object.entries(kourelNotes).some(([, n]) => n.commentaire) && (
                            <div className="mt-2 space-y-1">
                              <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider pt-1">Commentaires</p>
                              {Object.entries(kourelNotes).map(([id, n]) => {
                                if (!n.commentaire) return null
                                const m = membres.find(x => x.id === parseInt(id))
                                return (
                                  <div key={id} className="bg-gris-50 rounded-lg px-3 py-2 border border-gris-100">
                                    <p className="text-[10px] font-bold text-gris-500">{m ? `${m.prenom} ${m.nom}` : `Évaluateur ${id}`}</p>
                                    <p className="text-xs text-gris-700 italic mt-0.5">"{n.commentaire}"</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>}

                        {/* Conclusion + Note définitive pour ce kourel */}
                        <div className="px-4 py-3 border-t border-gris-100 bg-gris-50/60 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gris-700 mb-1.5">Conclusion pour ce kourel</p>
                            <Textarea
                              value={conclusionsKourel[k.id] ?? ''}
                              onChange={e => setConclusionsKourel(prev => ({ ...prev, [k.id]: e.target.value }))}
                              placeholder={`Conclusion pour ${k.kourel?.nom || 'ce kourel'}…`}
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gris-700">Note définitive</p>
                              <p className="text-[10px] text-gris-400">Vide = garder la moyenne</p>
                            </div>
                            <input
                              type="number" step="0.1" min="0" max="10"
                              value={notesDefinitives[k.id] ?? ''}
                              onChange={e => {
                                const v = e.target.value
                                if (v === '' || (parseFloat(v) >= 0 && parseFloat(v) <= 10)) {
                                  setNotesDefinitives(prev => ({ ...prev, [k.id]: v }))
                                }
                              }}
                              placeholder="—"
                              className="w-16 text-center text-lg font-black text-blue-600 bg-white border-2 border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Section globale — uniquement si 2+ kourels */}
                {(selected.kourels || []).length >= 2 && (
                  <div className="rounded-xl border-2 border-gris-200 bg-gris-50/50 p-4 space-y-4">
                    <p className="text-xs font-bold text-gris-500 uppercase tracking-wider">Bilan global de l'événement</p>

                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gris-700 mb-1.5">Conclusion générale</p>
                        <Textarea
                          value={conclusion}
                          onChange={e => setConclusion(e.target.value)}
                          placeholder="Synthèse globale de l'événement…"
                          rows={3}
                        />
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <p className="text-xs font-semibold text-gris-700 mb-1.5">Note globale</p>
                        <input
                          type="number" step="0.1" min="0" max="10"
                          value={noteGlobale}
                          onChange={e => {
                            const v = e.target.value
                            if (v === '' || (parseFloat(v) >= 0 && parseFloat(v) <= 10)) setNoteGlobale(v)
                          }}
                          placeholder="—"
                          className="w-16 text-center text-lg font-black text-gris-800 bg-white border-2 border-gris-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-vert-400 focus:border-vert-300 shadow-sm"
                        />
                        <p className="text-[9px] text-gris-400 mt-1">Vide = pas de note</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1 rounded-lg">
                    Fermer
                  </Button>
                </SheetClose>
                <Button onClick={sauvegarderConclusion} disabled={saving} className="flex-1 gap-1.5 rounded-lg">
                  {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                  Enregistrer la conclusion
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
