import { useState, useMemo, useEffect } from 'react'
import { Calendar, MapPin, Star, ChevronRight, ChevronDown, Users, CheckCircle2, Clock, AlertCircle, Save, Loader, X, Search, SlidersHorizontal, ChevronLeft, ChevronFirst, ChevronLast } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
  return (allNotes.reduce((a, b) => a + b, 0) / allNotes.length).toFixed(1)
}

function getStatusEval(notes) {
  if (!notes) return { label: 'En attente', class: 'bg-amber-50 text-amber-700' }
  const filled = Object.values(notes.notes || {}).filter(n => n.note != null).length
  const total = Object.keys(notes.notes || {}).length
  if (filled === 0) return { label: 'En attente', class: 'bg-amber-50 text-amber-700' }
  if (filled < total) return { label: 'En cours', class: 'bg-blue-50 text-blue-700' }
  return { label: 'Soumis', class: 'bg-vert-50 text-vert-700' }
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
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

function EventCard({ event, onClick }) {
  const moy = getMoyenneGlobale(event.notes)
  const soumis = Object.keys(event.notes).length
  const total = event.evaluateurs.length
  const progres = total > 0 ? Math.round((soumis / total) * 100) : 0

  return (
    <Card
      onClick={() => onClick(event)}
      className="group border-gris-200 shadow-sm hover:border-vert-400 hover:shadow-lg cursor-pointer transition-all duration-200 overflow-hidden"
    >
      <div className={`h-1.5 w-full ${
        event.statut === 'terminé' ? 'bg-vert-500' :
        event.statut === 'en cours' ? 'bg-blue-500' :
        'bg-amber-500'
      }`} />

      <CardContent className="p-0">
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gris-100 flex items-center justify-center flex-shrink-0 group-hover:bg-vert-100 transition-colors">
                <Calendar size={16} className="text-gris-500 group-hover:text-vert-700 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gris-950 truncate">{event.type_nom}</p>
                <p className="text-[11px] text-gris-500 truncate">{formatDate(event.date_evenement)}</p>
              </div>
            </div>
            <Badge className={`text-[10px] font-semibold px-2 py-0.5 border ${STATUS_STYLES[event.statut] || ''}`}>
              {event.statut}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gris-600">
              <MapPin size={11} className="text-gris-400 flex-shrink-0" />
              <span>{event.lieu_nom}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gris-700 font-medium">
              <Users size={11} className="text-gris-400 flex-shrink-0" />
              <span className="truncate">{event.kourel?.nom || '—'}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-4 pt-3">
          {moy != null ? (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={12}
                    className={i < Math.round((moy / 10) * 5) ? 'fill-amber-400 text-amber-400' : 'text-gris-200'}
                  />
                ))}
                <span className="text-sm font-bold text-gris-950 ml-1">{moy}</span>
                <span className="text-[10px] text-gris-400 font-medium">/10</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gris-400 italic mb-2">Pas encore noté</p>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gris-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progres === 100 ? 'bg-vert-500' : progres > 0 ? 'bg-blue-500' : 'bg-gris-300'
                }`}
                style={{ width: `${progres}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-gris-500 flex-shrink-0">
              {soumis}/{total}
            </span>
          </div>

          {event.conclusion && (
            <div className="mt-2 pt-2 border-t border-dashed border-gris-100">
              <p className="text-[10px] text-gris-500 line-clamp-1 leading-relaxed">
                <span className="font-semibold text-vert-700">Note : </span>
                {event.conclusion}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <span className="text-[10px] font-semibold text-vert-700 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir détails <ChevronRight size={11} />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EvaluateurPanel({ evaluateur, notes, sections }) {
  const [open, setOpen] = useState(false)
  const status = getStatusEval(notes)

  return (
    <Card className="border-gris-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gris-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-vert-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-vert-800">
              {evaluateur.prenom?.[0]}{evaluateur.nom?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gris-950 truncate">{evaluateur.prenom} {evaluateur.nom}</p>
            <p className="text-xs text-gris-500 truncate">{evaluateur.kourel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {notes?.note_finale != null && (
            <span className="text-sm font-bold text-vert-700">{notes.note_finale}/10</span>
          )}
          <Badge className={`text-[10px] font-semibold px-2 py-0.5 ${status.class}`}>
            {status.label}
          </Badge>
          {open ? <ChevronDown size={15} className="text-gris-400" /> : <ChevronRight size={15} className="text-gris-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gris-100 pt-3">
          {notes ? (
            <div className="space-y-2">
              {sections.map(section => {
                const s = notes.notes?.[section.key || section.id]
                if (!s) return null
                return (
                  <div key={section.id} className="bg-gris-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[11px] font-semibold text-gris-700">{section.label}</p>
                      {s.note != null && (
                        <span className="text-xs font-bold text-vert-700">{s.note}/10</span>
                      )}
                    </div>
                    {s.appreciation && (
                      <p className="text-[11px] text-gris-600">
                        <span className="text-gris-400">Appréciation : </span>
                        {s.appreciation}
                      </p>
                    )}
                    {s.remarques && (
                      <p className="text-[11px] text-gris-500 italic mt-0.5">"{s.remarques}"</p>
                    )}
                  </div>
                )
              })}
              {notes.commentaire && (
                <div className="pt-2 border-t border-gris-100">
                  <p className="text-[11px] font-semibold text-gris-500">Commentaire :</p>
                  <p className="text-xs text-gris-700 mt-0.5">{notes.commentaire}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gris-400 italic text-center py-4">Évaluation non soumise.</p>
          )}
        </div>
      )}
    </Card>
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
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterType, setFilterType] = useState('tous')
  const [filterLieu, setFilterLieu] = useState('tous')

  const [page, setPage] = useState(1)
  const perPage = 6

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
      return true
    })
  }, [evenements, search, filterStatut, filterType, filterLieu])

  const totalPages = Math.max(1, Math.ceil(filtres.length / perPage))
  const pageCourante = Math.min(page, totalPages)
  const pagines = filtres.slice((pageCourante - 1) * perPage, pageCourante * perPage)

  const ouvrirDetail = (e) => {
    setSelected(e)
    setConclusion(e.conclusion || '')
  }

  const sauvegarderConclusion = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await modifierEvenement(selected.id, { conclusion })
      setEvenements(list => list.map(e =>
        e.id === selected.id ? { ...e, conclusion } : e
      ))
      setSelected(s => ({ ...s, conclusion }))
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const typesList = types || []
  const lieuxList = [...new Set(evenements.map(e => e.lieu_nom).filter(Boolean))]

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Évaluations']}
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

          {(search || filterStatut !== 'tous' || filterType !== 'tous' || filterLieu !== 'tous') && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-gris-500"
              onClick={() => { setSearch(''); setFilterStatut('tous'); setFilterType('tous'); setFilterLieu('tous'); setPage(1) }}>
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
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gris-500">
                {filtres.length} résultat{filtres.length > 1 ? 's' : ''}
                {filtres.length !== evenements.length && (
                  <span> (sur {evenements.length})</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagines.map(e => (
                <EventCard key={e.id} event={e} onClick={ouvrirDetail} />
              ))}
            </div>

            <Pagination currentPage={pageCourante} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}>
        <SheetContent className="w-full sm:max-w-2xl bg-white p-0 flex flex-col h-full">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="text-lg font-bold text-gris-950">
                      {selected.type_nom}
                    </SheetTitle>
                    <div className="text-sm text-gris-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(selected.date_evenement)}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} />{selected.lieu_nom}</span>
                      <span className="flex items-center gap-1.5 font-medium text-gris-700"><Users size={13} />{selected.kourel?.nom || '—'}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${STATUS_STYLES[selected.statut] || ''}`}>
                    {selected.statut}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {selected.evaluateurs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gris-200 rounded-lg bg-gris-50/50">
                    <Users size={28} className="mx-auto mb-2 text-gris-300" />
                    <p className="text-sm text-gris-500">Aucun évaluateur assigné</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-3">
                      Évaluateurs ({selected.evaluateurs.length})
                    </p>
                    <div className="space-y-2">
                      {selected.evaluateurs.map(id => {
                        const m = membres.find(x => x.id === id)
                        if (!m) return null
                        return (
                          <EvaluateurPanel key={id} evaluateur={m} notes={selected.notes?.[id] || null} sections={SECTIONS} />
                        )
                      })}
                    </div>
                  </div>
                )}

                {Object.keys(selected.notes).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gris-500 uppercase tracking-widest">Synthèse des évaluations</p>

                    <div className="rounded-xl border border-gris-200 overflow-hidden bg-white">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-2 border-b border-gris-100 bg-gris-50">
                        <span className="text-[10px] font-bold text-gris-400 uppercase tracking-wider">Section</span>
                        <span className="text-[10px] font-bold text-gris-400 uppercase tracking-wider text-right">Appréciation</span>
                        <span className="text-[10px] font-bold text-gris-400 uppercase tracking-wider text-right w-12">Moy.</span>
                      </div>
                      {SECTIONS.filter(s => s.label !== 'Appréciation générale').map(section => {
                        const vals = Object.values(selected.notes).map(n => n.notes?.[section.key]?.note).filter(v => v != null)
                        const moy = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
                        const appr = getModeAppreciation(selected.notes, section.key)
                        const ac = appr ? APPREC_COLORS[appr] : null
                        return (
                          <div key={section.id} className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-3 py-2.5 border-b border-gris-50 last:border-0">
                            <span className="text-xs font-medium text-gris-700">{section.label}</span>
                            {appr ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: ac.color, background: ac.bg }}>
                                {appr}
                              </span>
                            ) : <span className="text-xs text-gris-300">—</span>}
                            <span className="text-xs font-bold text-gris-800 text-right w-12">{moy ? `${moy}/10` : '—'}</span>
                          </div>
                        )
                      })}
                    </div>

                    {(() => {
                      const noteFin = getNoteFinaleAvg(selected.notes)
                      const apprGen = getModeAppreciation(selected.notes, 'generale')
                      const ac = apprGen ? APPREC_COLORS[apprGen] : null
                      if (!noteFin && !apprGen) return null
                      return (
                        <div className="rounded-xl border-2 border-vert-200 bg-vert-50/50 px-4 py-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-vert-600 uppercase tracking-wider mb-1">Bilan général</p>
                            {apprGen && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: ac.color, background: ac.bg }}>
                                {apprGen}
                              </span>
                            )}
                          </div>
                          {noteFin && (
                            <div className="text-right">
                              <p className="text-[10px] text-vert-600 font-semibold mb-0.5">Note générale</p>
                              <p className="text-2xl font-black text-vert-700 leading-none">{noteFin}<span className="text-sm text-vert-500">/10</span></p>
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {Object.entries(selected.notes).some(([, n]) => n.commentaire) && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-gris-400 uppercase tracking-wider">Commentaires</p>
                        {Object.entries(selected.notes).map(([id, n]) => {
                          if (!n.commentaire) return null
                          const m = membres.find(x => x.id === parseInt(id))
                          return (
                            <div key={id} className="bg-gris-50 rounded-lg px-3 py-2.5 border border-gris-100">
                              <p className="text-[10px] font-bold text-gris-500 mb-1">{m ? `${m.prenom} ${m.nom}` : `Évaluateur ${id}`}</p>
                              <p className="text-xs text-gris-700 leading-relaxed italic">"{n.commentaire}"</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-2">
                    Conclusion (Admin)
                  </p>
                  <Textarea
                    value={conclusion}
                    onChange={e => setConclusion(e.target.value)}
                    placeholder="Rédigez votre évaluation globale de l'événement…"
                    rows={4}
                  />
                </div>
              </div>

              <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1 gap-1.5 rounded-lg">
                    <X size={14} /> Fermer
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
