import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, Calendar, MapPin, Users, ChevronRight, ChevronDown, Eye, CheckCircle2, Clock, AlertCircle, ToggleLeft, Copy, KeyRound, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { ComboboxMulti } from '@/components/ui/combobox'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'
import {
  fetchEvenements, ajouterEvenement, modifierEvenement, supprimerEvenement,
  fetchTypesEvenements, fetchLieux, fetchMembres, fetchKourels,
  fetchEvalMembres, assignerEvalMembre, supprimerEvalMembre, supprimerEvenementKourels,
  ajouterEvenementKourel, ajouterLieu,
  fetchEvaluations, fetchCriteres,
} from '@/lib/supabase'

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

function getEvaluateurStatus(note) {
  if (!note) return { label: 'Non assigné', class: 'bg-gris-100 text-gris-600', icon: AlertCircle }
  const filled = Object.values(note.notes || {}).filter(v => v != null && v.note != null).length
  const total = Object.keys(note.notes || {}).length
  if (filled === 0) return { label: 'En attente', class: 'bg-amber-50 text-amber-700', icon: Clock }
  if (filled < total) return { label: 'En cours', class: 'bg-blue-50 text-blue-700', icon: ToggleLeft }
  return { label: 'Soumis', class: 'bg-vert-50 text-vert-700', icon: CheckCircle2 }
}

const SECTIONS = [
  { id: 'melodie', label: 'Maitrise de la mélodie' },
  { id: 'hourouf', label: 'Phonétique "Hourouf"' },
  { id: 'timing', label: 'Temps de prestation' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'presence', label: 'Présence' },
  { id: 'ponctualite', label: 'Ponctualité' },
  { id: 'generale', label: 'Appréciation générale' },
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CodeRow({ membre, code }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gris-700 truncate">{membre ? `${membre.prenom} ${membre.nom}` : '—'}</p>
        <span className="text-xs font-mono font-bold text-amber-800 tracking-wider">{code}</span>
      </div>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded hover:bg-amber-100 transition flex items-center gap-1 flex-shrink-0"
      >
        <Copy size={11} /> {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  )
}

function EvaluateurDetail({ evaluateur, note, code, onCopyCode }) {
  const [open, setOpen] = useState(false)
  const effectiveNote = note || (code ? { notes: {}, note_finale: null, commentaire: '', soumis: false } : null)
  const status = getEvaluateurStatus(effectiveNote)
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
    onCopyCode?.(code)
  }

  return (
    <Card className="border-gris-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gris-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-vert-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-vert-800">
              {evaluateur.prenom[0]}{evaluateur.nom[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gris-950 truncate">{evaluateur.prenom} {evaluateur.nom}</p>
            <p className="text-xs text-gris-500 truncate">{evaluateur.kourel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {code && (
            <span className="text-[10px] font-mono text-gris-400 hidden sm:inline">{code}</span>
          )}
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${status.class}`}>
            {status.label}
          </Badge>
          {open ? <ChevronDown size={16} className="text-gris-400" /> : <ChevronRight size={16} className="text-gris-400" />}
        </div>
      </button>

      {open && code && (
        <div className="px-4 pb-2 border-t border-gris-100 pt-2">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <KeyRound size={13} className="text-amber-600" />
              <span className="text-xs font-mono font-bold text-amber-800 tracking-wider">{code}</span>
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition px-2 py-1 rounded hover:bg-amber-100"
            >
              <Copy size={12} />
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>
      )}

      {open && effectiveNote && (
        <div className="px-4 pb-4 border-t border-gris-100 pt-3 space-y-3">
          {SECTIONS.map(section => (
            <div key={section.id} className="bg-gris-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gris-700 mb-2">
                {section.label}
                {effectiveNote.notes?.[section.id]?.nombre_present != null && (
                  <span className="ml-1.5 font-normal text-gris-400">({effectiveNote.notes[section.id].nombre_present} présent(s))</span>
                )}
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gris-500">Appréciation : </span>
                  <span className="font-medium text-gris-800">{effectiveNote.notes?.[section.id]?.appreciation || '—'}</span>
                </div>
                <div>
                  <span className="text-gris-500">Note : </span>
                  <span className="font-medium text-gris-800">{effectiveNote.notes?.[section.id]?.note != null ? `${effectiveNote.notes[section.id].note}/10` : '—'}</span>
                </div>
              </div>
              {effectiveNote.notes?.[section.id]?.remarques && (
                <p className="text-xs text-gris-600 mt-1 italic">
                  "{effectiveNote.notes[section.id].remarques}"
                </p>
              )}
            </div>
          ))}
          {effectiveNote.commentaire && (
            <div className="pt-2 border-t border-gris-200">
              <p className="text-xs font-semibold text-gris-500">Commentaire :</p>
              <p className="text-xs text-gris-700 mt-0.5">{effectiveNote.commentaire}</p>
            </div>
          )}
          {effectiveNote.note_finale != null && (
            <div className="flex items-center gap-2 pt-2 border-t border-gris-200">
              <span className="text-xs font-semibold text-gris-700">Note finale :</span>
              <span className="text-sm font-bold text-vert-700">{effectiveNote.note_finale}/10</span>
            </div>
          )}
        </div>
      )}

      {open && !effectiveNote && (
        <div className="px-4 pb-4 border-t border-gris-100 pt-3">
          <p className="text-xs text-gris-400 italic">Ce membre n'a pas encore soumis son évaluation.</p>
        </div>
      )}
    </Card>
  )
}

export function EvenementsPage() {
  const [data, setData] = useState([])
  const [types, setTypes] = useState([])
  const [lieux, setLieux] = useState([])
  const [membresData, setMembresData] = useState([])
  const [kourelsData, setKourelsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState(null)
  const [form, setForm] = useState({
    type_id: '', date_evenement: '', lieu: '',
    kourels: [], // { kourel_id, evaluateurs: [], paginateurs: [], codes: {} }
  })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false })
  const [errorMsg, setErrorMsg] = useState(null)
  const [eventNotes, setEventNotes] = useState({})
  const [criteresData, setCriteresData] = useState([])
  const dateInputRef = useRef(null)
  const [refreshingNotes, setRefreshingNotes] = useState(false)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (data.length > 0 && criteresData.length > 0) {
      data.forEach(ev => {
        if (!eventNotes[ev.id]) chargerNotesEvaluation(ev.id)
      })
    }
  }, [data.length, criteresData.length])

  async function loadData() {
    setLoading(true)
    try {
      const [evts, tps, lxs, mbrs, kls, crits] = await Promise.all([
        fetchEvenements(), fetchTypesEvenements(), fetchLieux(), fetchMembres(), fetchKourels(), fetchCriteres()
      ])
      setCriteresData(crits || [])
      setData(evts || [])
      setTypes(tps || [])
      setLieux(lxs || [])
      setMembresData(mbrs || [])
      setKourelsData(kls || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const getEvaluateurNote = (eventId, evaluateurId) => {
    return eventNotes[eventId]?.[evaluateurId] || null
  }

  const handleRefreshNotes = async () => {
    if (!detailEvent) return
    setRefreshingNotes(true)
    try {
      await chargerNotesEvaluation(detailEvent.id)
    } finally {
      setRefreshingNotes(false)
    }
  }

  async function chargerNotesEvaluation(eventId) {
    try {
      const evals = await fetchEvaluations(eventId)
      const notes = {}
      ;(evals || []).forEach(ev => {
        const sectionNotes = {}
        ;(ev.notes || []).forEach(n => {
          const critere = criteresData.find(c => c.id === n.critere_id)
          const section = SECTIONS.find(s => s.label === (critere?.section_nom || ''))
          const key = section ? section.id : String(n.critere_id)
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
      setEventNotes(prev => ({ ...prev, [eventId]: notes }))
    } catch (e) {
      console.error('Erreur chargement notes:', e)
    }
  }

  const ouvrirDetail = (e) => {
    setDetailEvent(e)
    if (!eventNotes[e.id]) {
      chargerNotesEvaluation(e.id)
    }
  }

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />
      ),
      enableSorting: false,
    },
    {
      header: 'Événement',
      accessorKey: 'type_id',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gris-950">{types.find(t => t.id === row.original.type_id)?.nom || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date_evenement',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-gris-700">
          <Calendar size={13} className="text-vert-600 flex-shrink-0" />
          {formatDate(row.original.date_evenement)}
        </div>
      ),
    },
    {
      header: 'Lieu',
      accessorKey: 'lieu',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-gris-700">
          <MapPin size={13} className="text-vert-600 flex-shrink-0" />
          {row.original.lieu?.nom || row.original.lieu}
        </div>
      ),
    },
    {
      header: 'Évaluateurs',
      id: 'evaluateurs',
      cell: ({ row }) => {
        const ev = row.original
        const notes = eventNotes[ev.id] || {}
        const soumis = Object.values(notes).filter(n => n.soumis).length
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Users size={13} className="text-gris-400 flex-shrink-0" />
            <span className="text-gris-700">{(ev.evaluateurs || []).length}</span>
            {soumis > 0 && (
              <span className="text-xs text-vert-600 font-medium">({soumis} soumis)</span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Statut',
      accessorKey: 'statut',
      cell: ({ row }) => {
        const s = row.original.statut
        const classes = {
          'terminé': 'text-vert-700 bg-vert-50',
          'en cours': 'text-blue-700 bg-blue-50',
          'à venir': 'text-amber-700 bg-amber-50',
        }
        return (
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${classes[s] || 'text-gris-600 bg-gris-100'}`}>
            {s}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const e = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => ouvrirDetail(e)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
              <Eye size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(e)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
              <Edit2 size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => supprimer(e)}
              className="h-8 w-8 text-gris-400 hover:text-rouge hover:bg-rouge-bg">
              <Trash2 size={14} />
            </Button>
          </div>
        )
      },
    },
  ], [data, types])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const ouvrirAjout = () => {
    setForm({ type_id: '', date_evenement: '', lieu: '', kourels: [] })
    setEditingId(null)
    setErrorMsg(null)
    setSheetOpen(true)
  }
  const ouvrirEdition = (e) => {
    const kourels = (e.kourels || []).map(ek => ({
      kourel_id: String(ek.kourel_id || ek.kourel?.id || ''),
      evaluateurs: [...(ek.evaluateurs || [])],
      paginateurs: [...(ek.paginateurs || [])],
      codes: { ...(ek.codes || {}) },
    }))
    setForm({
      type_id: String(e.type_id), date_evenement: e.date_evenement,
      lieu: String(e.lieu_id || e.lieu?.id || ''),
      kourels,
    })
    setEditingId(e.id)
    setErrorMsg(null)
    setSheetOpen(true)
  }
  function genererCodes(evaluateurs, existingCodes = {}) {
    const codes = {}
    evaluateurs.forEach(membreId => {
      codes[membreId] = existingCodes[membreId] || genererCodeAcces()
    })
    return codes
  }

  const changerStatutEvent = (id, statut) => {
    setData(list => list.map(e => e.id === id ? { ...e, statut } : e))
    setDetailEvent(d => d ? { ...d, statut } : d)
  }

  const sauvegarder = async () => {
    if (!form.type_id || !form.date_evenement || !form.lieu || !form.kourels.length) return
    setSaving(true)
    try {
      const now = new Date()
      const eventDate = new Date(form.date_evenement + 'T23:59:59')
      let statut = 'à venir'
      if (eventDate < now) statut = 'terminé'

      let lieuId = Number(form.lieu)
      if (form.lieu === '__custom__' && form.customLieu?.trim()) {
        const newLieu = await ajouterLieu(form.customLieu.trim())
        lieuId = newLieu.id
      }

      const payload = {
        type_id: Number(form.type_id),
        date_evenement: form.date_evenement,
        lieu_id: lieuId || null,
        statut,
      }

      let eventId
      if (editingId) {
        await modifierEvenement(editingId, payload)
        eventId = editingId
        await supprimerEvenementKourels(eventId)
      } else {
        const newEvt = await ajouterEvenement(payload)
        eventId = newEvt.id
      }

      for (const k of form.kourels) {
        const ek = await ajouterEvenementKourel(eventId, Number(k.kourel_id))
        const evalIds = k.evaluateurs || []
        const pagIds = k.paginateurs || []
        for (const membreId of evalIds) {
          const code = k.codes?.[membreId] || genererCodeAcces()
          try {
            await assignerEvalMembre(ek.id, membreId, 'evaluateur', code)
          } catch (e) { if (e.code !== '23505') throw e }
        }
        for (const membreId of pagIds) {
          try {
            await assignerEvalMembre(ek.id, membreId, 'paginateur', null)
          } catch (e) { if (e.code !== '23505') throw e }
        }
      }

      await loadData()
      setErrorMsg(null)
      setSheetOpen(false)
    } catch (e) {
      console.error(e)
      setErrorMsg(e?.message || e?.error?.message || 'Erreur lors de la sauvegarde')
    }
    finally { setSaving(false) }
  }
  const supprimer = (e) => {
    const typeName = types.find(t => t.id === e.type_id)?.nom || 'Événement'
    const label = `${typeName} du ${formatDate(e.date_evenement)}`
    setDeleteDialog({ open: true, item: e, label, loading: false })
  }

  const confirmerSuppression = async () => {
    if (!deleteDialog.item) return
    setDeleteDialog(d => ({ ...d, loading: true }))
    try {
      await supprimerEvenement(deleteDialog.item.id)
      setData(list => list.filter(x => x.id !== deleteDialog.item.id))
      setDeleteDialog({ open: false, item: null, label: '', loading: false })
    } catch (e) {
      console.error(e)
      setDeleteDialog(d => ({ ...d, loading: false }))
    }
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité suivi & Évaluation', 'Événements']}
        title="Événements"
        subtitle=""
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadData} disabled={loading} className="gap-1.5">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={ouvrirAjout} className="gap-1.5">
              <Plus size={15} /> Créer un événement
            </Button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gris-200 overflow-hidden bg-white">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader size={36} className="mx-auto mb-3 text-gris-300 animate-spin" />
              <p className="text-sm font-semibold text-gris-700">Chargement…</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Calendar size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun événement</p>
              <p className="text-xs text-gris-500 mt-1">Créez votre premier événement.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-gris-100 border-b-2 border-gris-200">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}
                        className="text-[11px] font-semibold text-gris-700 uppercase tracking-wider"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5 cursor-pointer select-none">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                            <span className="text-gris-400 text-[10px]">{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}
                    className={`border-b border-gris-100 transition-colors ${row.getIsSelected() ? 'bg-vert-50/50' : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex-shrink-0 flex items-center justify-between border-t border-gris-100 px-4 py-2.5 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gris-500">Lignes</span>
            <Select value={String(pagination.pageSize)} onValueChange={v => setPagination({ pageIndex: 0, pageSize: Number(v) })}>
              <SelectTrigger className="h-7 text-xs w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 8, 10, 20, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-gris-500 ml-2">
              {Object.keys(rowSelection).length} sur {data.length} sélectionné(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 text-xs px-3"
            >
              Précédent
            </Button>
            <span className="text-xs text-gris-500 tabular-nums">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button variant="outline" size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 text-xs px-3"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailEvent} onOpenChange={open => !open && setDetailEvent(null)}>
        <SheetContent 
          className="w-full sm:max-w-2xl bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {detailEvent && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <SheetTitle className="text-lg font-bold text-gris-950">
                    {types.find(t => t.id === detailEvent.type_id)?.nom || '—'}
                  </SheetTitle>
                  <div className="text-sm text-gris-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(detailEvent.date_evenement)}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} />{detailEvent.lieu?.nom || detailEvent.lieu}</span>
                    <span className="flex items-center gap-1.5 font-medium text-gris-700"><Users size={13} />{(detailEvent.kourels || []).map(ek => ek.kourel?.nom).filter(Boolean).join(', ')}</span>
                  </div>
                  <div className="mt-3">
                    <Select value={detailEvent.statut} onValueChange={s => changerStatutEvent(detailEvent.id, s)}>
                      <SelectTrigger className={`h-8 w-36 text-xs font-semibold border-0 ${
                        detailEvent.statut === 'terminé' ? 'bg-vert-50 text-vert-700' :
                        detailEvent.statut === 'en cours' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="à venir">À venir</SelectItem>
                        <SelectItem value="en cours">En cours</SelectItem>
                        <SelectItem value="terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {(detailEvent.kourels || []).length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gris-200 rounded-lg bg-gris-50/50">
                    <Users size={28} className="mx-auto mb-2 text-gris-300" />
                    <p className="text-sm text-gris-500">Aucun kourel assigné</p>
                  </div>
                ) : (
                  (detailEvent.kourels || []).map(ek => (
                    <div key={ek.id} className="border border-gris-200 rounded-xl overflow-hidden">
                      <div className="bg-gris-50 px-4 py-3 border-b border-gris-100 flex items-center gap-2">
                        <Users size={14} className="text-vert-600" />
                        <span className="text-sm font-bold text-gris-950">{ek.kourel?.nom || 'Kourel'}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {ek.evaluateurs?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider mb-2">
                              Évaluateurs ({ek.evaluateurs.length})
                            </p>
                            <div className="space-y-2">
                              {ek.evaluateurs.map(id => {
                                const m = membresData.find(x => x.id === id)
                                if (!m) return null
                                return (
                                  <EvaluateurDetail
                                    key={id}
                                    evaluateur={m}
                                    note={getEvaluateurNote(detailEvent.id, id)}
                                    code={ek.codes?.[id]}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {ek.paginateurs?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider mb-2">
                              Paginateurs ({ek.paginateurs.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {ek.paginateurs.map(id => {
                                const m = membresData.find(x => x.id === id)
                                return m ? (
                                  <Badge key={id} className="text-xs bg-gris-100 text-gris-700 border-gris-200">
                                    {m.prenom} {m.nom}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <SheetFooter className="px-6 py-4 border-t border-gris-100 flex-shrink-0">
                <div className="flex items-center gap-2 w-full">
                  <Button variant="ghost" size="sm" onClick={handleRefreshNotes} disabled={refreshingNotes} className="gap-1.5">
                    <RefreshCw size={14} className={refreshingNotes ? 'animate-spin' : ''} /> Actualiser
                  </Button>
                  <div className="flex-1" />
                  <SheetClose asChild>
                    <Button variant="outline" className="rounded-lg">
                      Fermer
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0 flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-gris-950">
                {editingId ? "Modifier l'événement" : "Nouvel événement"}
              </SheetTitle>
              <p className="text-sm text-gris-500 mt-1">
                {editingId ? 'Modifiez les informations' : 'Créez une instance avec date, lieu, koureul et équipe'}
              </p>
            </div>
          </SheetHeader>

          {errorMsg && (
            <div className="mx-6 mt-4 text-xs font-semibold text-rouge bg-rouge-bg border border-rouge/20 rounded-lg px-3 py-2.5">
              {errorMsg}
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                Type d'événement
              </Label>
              <Select value={form.type_id} onValueChange={v => setForm(f => ({ ...f, type_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type…" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Date</Label>
              <div className="relative">
                <Calendar 
                  size={16} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-400 cursor-pointer hover:text-gris-600 transition-colors" 
                  onClick={() => dateInputRef.current?.showPicker?.()}
                />
                <Input 
                  ref={dateInputRef}
                  type="date" 
                  value={form.date_evenement} 
                  onChange={e => setForm(f => ({ ...f, date_evenement: e.target.value }))} 
                  className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Lieu</Label>
              <Select value={form.lieu} onValueChange={v => setForm(f => ({ ...f, lieu: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un lieu…" />
                </SelectTrigger>
                <SelectContent>
                  {lieux.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.nom}</SelectItem>)}
                  <SelectItem value="__custom__">Autre (saisir libre)</SelectItem>
                </SelectContent>
              </Select>
              {form.lieu === '__custom__' && (
                <Input
                  className="mt-2"
                  placeholder="Saisir le lieu…"
                  value={form.customLieu || ''}
                  onChange={e => setForm(f => ({ ...f, customLieu: e.target.value }))}
                />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                  Kourels ({form.kourels.length})
                </Label>
                <Select value="" onValueChange={v => {
                  if (!v) return
                  if (form.kourels.some(k => k.kourel_id === v)) return
                  setForm(f => ({ ...f, kourels: [...f.kourels, { kourel_id: v, evaluateurs: [], paginateurs: [], codes: {} }] }))
                }}>
                  <SelectTrigger className="h-8 text-xs w-44">
                    <SelectValue placeholder="+ Ajouter un kourel" />
                  </SelectTrigger>
                  <SelectContent>
                    {kourelsData.filter(k => !form.kourels.some(fk => fk.kourel_id === String(k.id))).map(k => (
                      <SelectItem key={k.id} value={String(k.id)}>{k.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.kourels.length === 0 && (
                <p className="text-xs text-gris-400 italic">Ajoutez au moins un kourel à l'événement.</p>
              )}

              {form.kourels.map((k, ki) => (
                <div key={ki} className="border border-gris-200 rounded-xl overflow-hidden">
                  <div className="bg-gris-50 px-4 py-2.5 border-b border-gris-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-vert-600" />
                      <span className="text-sm font-bold text-gris-950">{kourelsData.find(kd => kd.id === Number(k.kourel_id))?.nom || 'Kourel'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, kourels: f.kourels.filter((_, i) => i !== ki) }))}
                      className="text-[10px] text-rouge hover:text-rouge/80 font-semibold px-2 py-1 rounded hover:bg-rouge/5 transition"
                    >
                      <X size={13} /> Retirer
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider">Évaluateurs</Label>
                      <ComboboxMulti
                        options={membresData.map(m => ({
                          value: m.id,
                          label: `${m.prenom} ${m.nom}`,
                          subtitle: m.kourel,
                        }))}
                        selected={k.evaluateurs}
                        onChange={v => {
                          const newCodes = { ...k.codes }
                          v.forEach(id => { if (!newCodes[id]) newCodes[id] = genererCodeAcces() })
                          setForm(f => {
                            const kourels = [...f.kourels]
                            kourels[ki] = { ...kourels[ki], evaluateurs: v, codes: newCodes }
                            return { ...f, kourels }
                          })
                        }}
                        placeholder="Rechercher…"
                        emptyMessage="Aucun membre"
                      />
                    </div>

                    {k.evaluateurs.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider flex items-center gap-1">
                          <KeyRound size={11} /> Codes d'accès
                        </Label>
                        <div className="space-y-1">
                          {k.evaluateurs.map(id => (
                            <CodeRow key={id} membre={membresData.find(x => x.id === id)} code={k.codes[id] || genererCodeAcces()} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-gris-500 uppercase tracking-wider">Paginateurs (optionnel)</Label>
                      <ComboboxMulti
                        options={membresData.map(m => ({
                          value: m.id,
                          label: `${m.prenom} ${m.nom}`,
                          subtitle: m.kourel,
                        }))}
                        selected={k.paginateurs}
                        onChange={v => setForm(f => {
                          const kourels = [...f.kourels]
                          kourels[ki] = { ...kourels[ki], paginateurs: v }
                          return { ...f, kourels }
                        })}
                        placeholder="Rechercher…"
                        emptyMessage="Aucun membre"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 rounded-lg">
                Annuler
              </Button>
            </SheetClose>
            <Button
              onClick={sauvegarder}
              disabled={!form.type_id || !form.date_evenement || !form.lieu || !form.kourels.length || saving}
              className="flex-1 gap-1.5 rounded-lg"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : "Créer l'événement"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer l'événement"
        description="Cette action est irréversible. L'événement et toutes ses données d'évaluation seront supprimés."
        itemName={deleteDialog.label}
        onConfirm={confirmerSuppression}
        loading={deleteDialog.loading}
        variant="danger"
      />
    </div>
  )
}
