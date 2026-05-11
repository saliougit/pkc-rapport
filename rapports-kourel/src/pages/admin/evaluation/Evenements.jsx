import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, Calendar, MapPin, Users, ChevronRight, ChevronDown, Eye, CheckCircle2, Clock, AlertCircle, ToggleLeft, ToggleRight, Copy, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Card, CardContent } from '@/components/ui/card'
import { ComboboxMulti } from '@/components/ui/combobox'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'

const TYPES_MOCK = [
  { id: 1, nom: 'Goudj' },
  { id: 2, nom: 'Aldiouma' },
  { id: 3, nom: 'Ziar' },
  { id: 4, nom: 'Magal' },
]
const LIEUX_MOCK = ['CAMPUS', 'ESP']
const MEMBRES_MOCK = [
  { id: 1, prenom: 'Ibrahima', nom: 'Fall', kourel: 'Kourel Serigne Babacar Sy' },
  { id: 2, prenom: 'Moussa', nom: 'Diop', kourel: 'Kourel El Hadj Malick Sy' },
  { id: 3, prenom: 'Abdoulaye', nom: 'Niang', kourel: 'Kourel Serigne Moussa Ka' },
  { id: 4, prenom: 'Cheikh', nom: 'Mbaye', kourel: 'Kourel Mame Thierno' },
  { id: 5, prenom: 'Fatou', nom: 'Sow', kourel: 'Kourel Serigne Babacar Sy' },
]
const KOURELS_MOCK = [
  'Kourel Serigne Babacar Sy',
  'Kourel Serigne Moussa Ka',
  'Kourel El Hadj Malick Sy',
  'Kourel Mame Thierno',
  'Kourel 1',
  'Kourel 2',
]

function getEvaluateurStatus(note) {
  if (!note) return { label: 'Non assigné', class: 'bg-gris-100 text-gris-600', icon: AlertCircle }
  const filled = Object.values(note.notes || {}).filter(v => v != null).length
  const total = 6
  if (filled === 0) return { label: 'En attente', class: 'bg-amber-50 text-amber-700', icon: Clock }
  if (filled < total) return { label: 'En cours', class: 'bg-blue-50 text-blue-700', icon: ToggleLeft }
  return { label: 'Soumis', class: 'bg-vert-50 text-vert-700', icon: CheckCircle2 }
}

const SECTIONS = [
  { id: 'melodie', label: 'Maitrise de la mélodie' },
  { id: 'hourouf', label: 'Phonétique "Hourouf"' },
  { id: 'timing', label: 'Temps de prestation' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'ponctualite', label: 'Ponctualité / Présence' },
  { id: 'generale', label: 'Appréciation générale' },
]

const APPRECIATIONS = ['Mauvais', 'Médiocre', 'Passable', 'Bien', 'Très bien', 'Excellent']

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function EvaluateurDetail({ evaluateur, note, code, onCopyCode }) {
  const [open, setOpen] = useState(false)
  const status = getEvaluateurStatus(note)
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

      {open && note && (
        <div className="px-4 pb-4 border-t border-gris-100 pt-3 space-y-3">
          {SECTIONS.map(section => (
            <div key={section.id} className="bg-gris-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gris-700 mb-2">{section.label}</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gris-500">Appréciation : </span>
                  <span className="font-medium text-gris-800">{note.notes?.[section.id]?.appreciation || '—'}</span>
                </div>
                <div>
                  <span className="text-gris-500">Note : </span>
                  <span className="font-medium text-gris-800">{note.notes?.[section.id]?.note != null ? `${note.notes[section.id].note}/10` : '—'}</span>
                </div>
              </div>
              {note.notes?.[section.id]?.remarques && (
                <p className="text-xs text-gris-600 mt-1 italic">
                  "{note.notes[section.id].remarques}"
                </p>
              )}
            </div>
          ))}
          {note.commentaire && (
            <div className="pt-2 border-t border-gris-200">
              <p className="text-xs font-semibold text-gris-500">Commentaire :</p>
              <p className="text-xs text-gris-700 mt-0.5">{note.commentaire}</p>
            </div>
          )}
          {note.note_finale != null && (
            <div className="flex items-center gap-2 pt-2 border-t border-gris-200">
              <span className="text-xs font-semibold text-gris-700">Note finale :</span>
              <span className="text-sm font-bold text-vert-700">{note.note_finale}/10</span>
            </div>
          )}
        </div>
      )}

      {open && !note && (
        <div className="px-4 pb-4 border-t border-gris-100 pt-3">
          <p className="text-xs text-gris-400 italic">Ce membre n'a pas encore soumis son évaluation.</p>
        </div>
      )}
    </Card>
  )
}

export function EvenementsPage() {
  const [data, setData] = useState([
    {
      id: 1, type_id: 1, date: '2026-04-15', lieu: 'CAMPUS',
      kourel: 'Kourel Serigne Babacar Sy',
      evaluateurs: [1, 2],
      paginateurs: [],
      statut: 'terminé',
      codes: { 1: 'EVAL-001-01', 2: 'EVAL-001-02' },
      notes: {
        1: {
          notes: {
            melodie: { appreciation: 'Très bien', note: 8, remarques: 'Bonne maitrise' },
            hourouf: { appreciation: 'Bien', note: 7, remarques: 'Quelques fautes' },
            timing: { appreciation: 'Excellent', note: 9, remarques: '' },
            discipline: { appreciation: 'Très bien', note: 8, remarques: '' },
            ponctualite: { appreciation: 'Bien', note: 7, remarques: '2 retardataires' },
            generale: { appreciation: 'Très bien', note: 8, remarques: 'Bonne prestation globale' },
          },
          note_finale: 8,
          commentaire: 'Très bon travail',
        },
        2: {
          notes: {
            melodie: { appreciation: 'Bien', note: 7, remarques: '' },
            hourouf: { appreciation: 'Passable', note: 6, remarques: 'Quelques yakh' },
            timing: { appreciation: 'Bien', note: 7, remarques: '' },
            discipline: { appreciation: 'Excellent', note: 9, remarques: 'Discipline exemplaire' },
            ponctualite: { appreciation: 'Bien', note: 7, remarques: '' },
            generale: { appreciation: 'Bien', note: 7, remarques: 'À améliorer sur les hourouf' },
          },
          note_finale: 7,
          commentaire: 'Bon dans l\'ensemble',
        },
      },
    },
    {
      id: 2, type_id: 2, date: '2026-05-02', lieu: 'ESP',
      kourel: 'Kourel El Hadj Malick Sy',
      evaluateurs: [2, 3, 5],
      paginateurs: [1],
      statut: 'à venir',
      codes: { 2: 'EVAL-002-02', 3: 'EVAL-002-03', 5: 'EVAL-002-05' },
      notes: {},
    },
    {
      id: 3, type_id: 4, date: '2026-05-20', lieu: 'CAMPUS',
      kourel: 'Kourel Serigne Moussa Ka',
      evaluateurs: [1, 3, 4],
      paginateurs: [2, 5],
      statut: 'en cours',
      codes: { 1: 'EVAL-003-01', 3: 'EVAL-003-03', 4: 'EVAL-003-04' },
      notes: {
        1: {
          notes: {
            melodie: { appreciation: 'Bien', note: 7, remarques: '' },
            hourouf: { appreciation: 'Bien', note: 7, remarques: '' },
          },
          note_finale: null,
          commentaire: '',
        },
      },
    },
  ])
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState(null)
  const [form, setForm] = useState({
    type_id: '', date: '', lieu: '', kourel: '',
    evaluateurs: [], paginateurs: [],
  })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const getTypeName = (id) => TYPES_MOCK.find(t => t.id === id)?.nom || '—'

  const getEvaluateurNote = (eventId, evaluateurId) => {
    const ev = data.find(e => e.id === eventId)
    return ev?.notes?.[evaluateurId] || null
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
          <p className="text-sm font-semibold text-gris-950">{getTypeName(row.original.type_id)}</p>
          <p className="text-xs text-gris-500">{row.original.kourel}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-gris-700">
          <Calendar size={13} className="text-vert-600 flex-shrink-0" />
          {formatDate(row.original.date)}
        </div>
      ),
    },
    {
      header: 'Lieu',
      accessorKey: 'lieu',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-gris-700">
          <MapPin size={13} className="text-vert-600 flex-shrink-0" />
          {row.original.lieu}
        </div>
      ),
    },
    {
      header: 'Évaluateurs',
      id: 'evaluateurs',
      cell: ({ row }) => {
        const ev = row.original
        const soumis = Object.keys(ev.notes).length
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Users size={13} className="text-gris-400 flex-shrink-0" />
            <span className="text-gris-700">{ev.evaluateurs.length}</span>
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
            <Button size="icon" variant="ghost" onClick={() => setDetailEvent(e)}
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
  ], [data])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  const ouvrirAjout = () => {
    setForm({ type_id: '', date: '', lieu: '', kourel: '', evaluateurs: [], paginateurs: [] })
    setEditingId(null)
    setSheetOpen(true)
  }
  const ouvrirEdition = (e) => {
    setForm({
      type_id: String(e.type_id), date: e.date, lieu: e.lieu, kourel: e.kourel,
      evaluateurs: [...e.evaluateurs], paginateurs: [...(e.paginateurs || [])],
    })
    setEditingId(e.id)
    setSheetOpen(true)
  }
  const toggleItem = (field, id) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter(x => x !== id) : [...f[field], id],
    }))
  }
  function genererCodes(evenementId, evaluateurs) {
    const codes = {}
    evaluateurs.forEach(membreId => {
      const key = `EVAL-${String(evenementId).padStart(3, '0')}-${String(membreId).padStart(2, '0')}`
      codes[membreId] = key
    })
    return codes
  }

  const sauvegarder = async () => {
    if (!form.type_id || !form.date || !form.lieu || !form.kourel) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    const now = new Date()
    const eventDate = new Date(form.date + 'T23:59:59')
    let statut = 'à venir'
    if (eventDate < now) statut = 'terminé'
    const newId = editingId || Date.now()
    const payload = {
      ...form,
      type_id: Number(form.type_id),
      evaluateurs: form.evaluateurs,
      paginateurs: form.paginateurs || [],
      statut,
      notes: editingId ? data.find(e => e.id === editingId)?.notes || {} : {},
      codes: editingId
        ? (data.find(e => e.id === editingId)?.codes || genererCodes(editingId, form.evaluateurs))
        : genererCodes(newId, form.evaluateurs),
    }
    if (editingId) {
      setData(list => list.map(e => e.id === editingId ? { ...e, ...payload } : e))
    } else {
      setData(list => [...list, { id: newId, ...payload }])
    }
    setSaving(false)
    setSheetOpen(false)
  }
  const supprimer = (e) => {
    if (!confirm(`Supprimer l'événement « ${getTypeName(e.type_id)} » du ${formatDate(e.date)} ?`)) return
    setData(list => list.filter(x => x.id !== e.id))
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Événements']}
        title="Événements"
        subtitle="Instances avec date, lieu, koureul, évaluateurs et paginateurs"
        action={
          <Button onClick={ouvrirAjout} className="gap-1.5">
            <Plus size={15} /> Créer un événement
          </Button>
        }
      />

      <div className="rounded-lg border border-gris-200 overflow-hidden bg-white">
        {data.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={36} className="mx-auto mb-3 text-gris-300" />
            <p className="text-sm font-semibold text-gris-700">Aucun événement</p>
            <p className="text-xs text-gris-500 mt-1">Créez votre premier événement.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
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
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gris-500">
          {Object.keys(rowSelection).length} sur {data.length} sélectionné(s)
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            Précédent
          </Button>
          <span className="text-xs text-gris-500">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs"
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailEvent} onOpenChange={open => !open && setDetailEvent(null)}>
        <SheetContent className="w-full sm:max-w-2xl bg-white p-0 flex flex-col h-full">
          {detailEvent && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-lg font-bold text-gris-950">
                      {getTypeName(detailEvent.type_id)}
                    </SheetTitle>
                    <div className="text-sm text-gris-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(detailEvent.date)}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} />{detailEvent.lieu}</span>
                      <span className="flex items-center gap-1.5 font-medium text-gris-700"><Users size={13} />{detailEvent.kourel}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${
                    detailEvent.statut === 'terminé' ? 'text-vert-700 bg-vert-50' :
                    detailEvent.statut === 'en cours' ? 'text-blue-700 bg-blue-50' :
                    'text-amber-700 bg-amber-50'
                  }`}>
                    {detailEvent.statut}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {detailEvent.paginateurs?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gris-600 bg-gris-50 rounded-lg px-3 py-2">
                    <Users size={13} className="text-gris-400" />
                    <span className="font-medium text-gris-700">Paginateurs :</span>
                    {detailEvent.paginateurs.map(id => {
                      const m = MEMBRES_MOCK.find(x => x.id === id)
                      return m ? `${m.prenom} ${m.nom}` : id
                    }).join(', ')}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-3">
                    Évaluateurs ({detailEvent.evaluateurs.length})
                  </p>
                  <div className="space-y-2">
                    {detailEvent.evaluateurs.map(id => {
                      const m = MEMBRES_MOCK.find(x => x.id === id)
                      if (!m) return null
                      return (
                        <EvaluateurDetail
                          key={id}
                          evaluateur={m}
                          note={getEvaluateurNote(detailEvent.id, id)}
                          code={detailEvent.codes?.[id]}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <SheetFooter className="px-6 py-4 border-t border-gris-100 flex-shrink-0">
                <SheetClose asChild>
                  <Button variant="outline" className="rounded-lg">
                    <X size={14} /> Fermer
                  </Button>
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <SheetTitle className="text-lg font-bold text-gris-950">
              {editingId ? "Modifier l'événement" : "Nouvel événement"}
            </SheetTitle>
            <p className="text-sm text-gris-500">
              {editingId ? 'Modifiez les informations' : 'Créez une instance avec date, lieu, koureul et équipe'}
            </p>
          </SheetHeader>

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
                  {TYPES_MOCK.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Lieu</Label>
              <Select value={form.lieu} onValueChange={v => setForm(f => ({ ...f, lieu: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un lieu…" />
                </SelectTrigger>
                <SelectContent>
                  {LIEUX_MOCK.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Koureul</Label>
              <Select value={form.kourel} onValueChange={v => setForm(f => ({ ...f, kourel: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un koureul" />
                </SelectTrigger>
                <SelectContent>
                  {KOURELS_MOCK.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                Évaluateurs assignés
              </Label>
              <ComboboxMulti
                options={MEMBRES_MOCK.map(m => ({
                  value: m.id,
                  label: `${m.prenom} ${m.nom}`,
                  subtitle: m.kourel,
                }))}
                selected={form.evaluateurs}
                onChange={v => setForm(f => ({ ...f, evaluateurs: v }))}
                placeholder="Rechercher un membre…"
                emptyMessage="Aucun membre trouvé"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                Paginateurs (optionnel)
              </Label>
              <ComboboxMulti
                options={MEMBRES_MOCK.map(m => ({
                  value: m.id,
                  label: `${m.prenom} ${m.nom}`,
                  subtitle: m.kourel,
                }))}
                selected={form.paginateurs}
                onChange={v => setForm(f => ({ ...f, paginateurs: v }))}
                placeholder="Rechercher un membre…"
                emptyMessage="Aucun membre trouvé"
              />
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 gap-1.5 rounded-lg">
                <X size={14} /> Annuler
              </Button>
            </SheetClose>
            <Button
              onClick={sauvegarder}
              disabled={!form.type_id || !form.date || !form.lieu || !form.kourel || saving}
              className="flex-1 gap-1.5 rounded-lg"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : "Créer l'événement"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
