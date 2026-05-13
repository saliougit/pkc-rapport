import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Edit2, Trash2, BookOpen, Send, Save, X,
  Loader, Phone, Key, Users, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'
import {
  fetchKourels, ajouterKourel, modifierKourel, supprimerKourel,
  fetchProgramme, ajouterKhassida, modifierKhassida, supprimerKhassida,
} from '@/lib/supabase'

function GestionProgramme({ kourel, onRetour }) {
  const [programme, setProgramme] = useState([])
  const [loading, setLoading] = useState(true)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '' })
  const [enEdition, setEnEdition] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProgramme(kourel.id).then(setProgramme).finally(() => setLoading(false))
  }, [kourel.id])

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.melodie) return
    setSaving(true)
    try {
      const k = await ajouterKhassida(kourel.id, nouveau.nom, nouveau.melodie, programme.length)
      setProgramme(p => [...p, k])
      setNouveau({ nom: '', melodie: '' })
    } finally { setSaving(false) }
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      await modifierKhassida(k.id, k.nom, k.melodie)
      setProgramme(p => p.map(x => x.id === k.id ? k : x))
      setEnEdition(null)
    } finally { setSaving(false) }
  }

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false })

  const supprimer = async (id) => {
    setDeleteDialog({ open: true, item: { id }, loading: false })
  }

  const confirmerSuppression = async () => {
    if (!deleteDialog.item) return
    setDeleteDialog(d => ({ ...d, loading: true }))
    try {
      await supprimerKhassida(deleteDialog.item.id)
      setProgramme(p => p.filter(x => x.id !== deleteDialog.item.id))
      setDeleteDialog({ open: false, item: null, loading: false })
    } catch (e) {
      console.error(e)
      setDeleteDialog(d => ({ ...d, loading: false }))
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        breadcrumb={['Kourels', kourel.nom, 'Programme Annuel']}
        title={`Programme — ${kourel.nom}`}
        subtitle={`${programme.length} khassida${programme.length > 1 ? 's' : ''} · ${kourel.responsable}`}
        action={
          <Button variant="outline" size="sm" onClick={onRetour} className="gap-1.5">
            <ChevronLeft size={15} /> Retour
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gris-200 bg-white p-5 space-y-3 self-start">
          <p className="text-sm font-semibold text-gris-950 flex items-center gap-2">
            <Plus size={15} /> Nouveau khassida
          </p>
          <Input placeholder="Nom du khassida" value={nouveau.nom}
            onChange={e => setNouveau(n => ({ ...n, nom: e.target.value }))} />
          <Input placeholder="Mélodie (ex: Serigne Abdou Diop)" value={nouveau.melodie}
            onChange={e => setNouveau(n => ({ ...n, melodie: e.target.value }))} />
          <Button onClick={ajouter} disabled={!nouveau.nom || !nouveau.melodie || saving} size="sm" className="w-full gap-1.5">
            {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            Ajouter
          </Button>
        </div>
        <div className="rounded-lg border border-gris-200 bg-white p-5">
          <p className="text-sm font-semibold text-gris-950 mb-3">Khassidas ({programme.length})</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader size={20} className="animate-spin text-gris-300" /></div>
          ) : programme.length === 0 ? (
            <div className="text-center py-10 text-gris-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun khassida.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {programme.map((k, idx) => (
                <div key={k.id} className="border border-gris-200 rounded-lg p-3 hover:border-vert-400 transition-colors">
                  {enEdition?.id === k.id ? (
                    <div className="space-y-2">
                      <Input value={enEdition.nom} onChange={e => setEnEdition(x => ({ ...x, nom: e.target.value }))} />
                      <Input value={enEdition.melodie} onChange={e => setEnEdition(x => ({ ...x, melodie: e.target.value }))} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => sauvegarderEdition(enEdition)}
                          className="h-8 text-xs gap-1"><Save size={12} /> Sauvegarder</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEnEdition(null)} className="h-8 text-xs">Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-vert-700 w-5 text-center flex-shrink-0">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gris-950 truncate">{k.nom}</p>
                          <p className="text-xs text-gris-500 truncate">{k.melodie}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEnEdition({ ...k })}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50"><Edit2 size={13} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(k.id)}
                          className="h-7 w-7 text-gris-400 hover:text-rouge hover:bg-rouge-bg"><Trash2 size={13} /></Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer le khassida"
        description="Cette action est irréversible. La chanson sera supprimée du programme annuel."
        itemName={deleteDialog.item?.nom}
        onConfirm={confirmerSuppression}
        loading={deleteDialog.loading}
      />
    </div>
  )
}

function KourelForm({ data, onChange }) {
  return (
    <div className="space-y-5 py-2">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Nom du kourel</label>
        <Input value={data.nom} onChange={e => onChange({ ...data, nom: e.target.value })} placeholder="ex: Kourel Serigne Babacar Sy" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Responsable</label>
        <Input value={data.responsable} onChange={e => onChange({ ...data, responsable: e.target.value })} placeholder="Prénom Nom" />
      </div>
      <div className="pt-3 border-t border-gris-200">
        <p className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-4">Notifications WhatsApp</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gris-700 flex items-center gap-1.5">
              <Phone size={12} className="text-vert-600" /> Téléphone du responsable
            </label>
            <Input value={data.telephone || ''} onChange={e => onChange({ ...data, telephone: e.target.value })} placeholder="+221 77 000 00 00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gris-700 flex items-center gap-1.5">
              <Key size={12} className="text-vert-600" /> Clé API CallMeBot
            </label>
            <Input value={data.callmebot_apikey || ''} onChange={e => onChange({ ...data, callmebot_apikey: e.target.value })} placeholder="Clé reçue par WhatsApp" />
          </div>
        </div>
      </div>
    </div>
  )
}

const FORM_VIDE = { nom: '', responsable: '', telephone: '', callmebot_apikey: '' }

export function KourelsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [vueProgramme, setVueProgramme] = useState(null)
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  const [fetchError, setFetchError] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false })

  useEffect(() => {
    fetchKourels()
      .then(setData)
      .catch((err) => { console.error('[Kourels] Erreur fetch:', err); setFetchError(err?.message || String(err)); setData([]) })
      .finally(() => setLoading(false))
  }, [])

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
      header: 'Kourel',
      accessorKey: 'nom',
      cell: ({ row }) => <p className="text-sm font-semibold text-gris-950">{row.original.nom}</p>,
    },
    {
      header: 'Responsable',
      accessorKey: 'responsable',
      cell: ({ row }) => <p className="text-sm text-gris-700">{row.original.responsable}</p>,
    },
    {
      header: 'WhatsApp',
      id: 'whatsapp',
      cell: ({ row }) => {
        const k = row.original
        return k.telephone && k.callmebot_apikey
          ? <span className="text-xs font-semibold text-vert-700 bg-vert-50 px-2.5 py-0.5 rounded-full">WA ✓</span>
          : <span className="text-xs text-gris-400">—</span>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const k = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            {k.telephone && k.callmebot_apikey && (
              <Button size="icon" variant="ghost" onClick={() => envoyerRappel(k)}
                className="h-8 w-8 text-gris-400 hover:text-[#25D366] hover:bg-green-50" title="Rappel WhatsApp">
                <Send size={14} />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => setVueProgramme(k)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50" title="Programme annuel">
              <BookOpen size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(k)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50" title="Modifier">
              <Edit2 size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => supprimer(k)}
              className="h-8 w-8 text-gris-400 hover:text-rouge hover:bg-rouge-bg" title="Désactiver">
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
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const ouvrirAjout = () => { setForm(FORM_VIDE); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (k) => {
    setForm({ nom: k.nom, responsable: k.responsable, telephone: k.telephone || '', callmebot_apikey: k.callmebot_apikey || '' })
    setEditingId(k.id); setSheetOpen(true)
  }
  const sauvegarder = async () => {
    if (!form.nom || !form.responsable) return
    setSaving(true)
    try {
      if (editingId) {
        await modifierKourel(editingId, form.nom, form.responsable, form.telephone, form.callmebot_apikey)
        setData(list => list.map(k => k.id === editingId ? { ...k, ...form } : k))
      } else {
        const k = await ajouterKourel(form.nom, form.responsable)
        setData(list => [...list, k])
      }
      setSheetOpen(false)
    } finally { setSaving(false) }
  }
  const supprimer = async (k) => {
    setDeleteDialog({ open: true, item: k, loading: false })
  }

  const confirmerSuppression = async () => {
    if (!deleteDialog.item) return
    setDeleteDialog(d => ({ ...d, loading: true }))
    try {
      await supprimerKourel(deleteDialog.item.id)
      setData(list => list.filter(x => x.id !== deleteDialog.item.id))
      setDeleteDialog({ open: false, item: null, loading: false })
    } catch (err) {
      console.error(err)
      setDeleteDialog(d => ({ ...d, loading: false }))
    }
  }

  const envoyerRappel = async (kourel = null) => {
    const cible = kourel ? `« ${kourel.nom} »` : 'tous les kourels'
    if (!confirm(`Envoyer le rappel WhatsApp à ${cible} maintenant ?`)) return
    setSaving(true)
    try {
      const res = await fetch('/api/send-rappel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kourel_id: kourel?.id || null })
      })
      const data = await res.json()
      alert(data.message || 'Rappels envoyés !')
    } catch { alert('Erreur.') }
    finally { setSaving(false) }
  }

  if (vueProgramme) {
    return <GestionProgramme kourel={vueProgramme} onRetour={() => setVueProgramme(null)} />
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Paramètres', 'Kourels']}
        title="Kourels"
        subtitle={`${data.length} kourel${data.length > 1 ? 's' : ''} actifs`}
        action={
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <span className="text-xs font-medium text-gris-500 px-2 py-1 bg-gris-100 rounded">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => envoyerRappel(null)} disabled={saving} className="gap-1.5 text-xs">
              <Send size={13} /> Rappel global
            </Button>
            <Button size="sm" onClick={ouvrirAjout} className="gap-1.5">
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gris-200 overflow-hidden bg-white">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader size={22} className="animate-spin text-gris-300" /></div>
        ) : fetchError ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <p className="text-sm font-bold text-red-600 mb-1">Erreur Supabase</p>
              <p className="text-xs font-mono text-red-500 bg-red-50 rounded p-2">{fetchError}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun kourel</p>
              <p className="text-xs text-gris-500 mt-1">Ajoutez votre premier kourel.</p>
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
              {selectedCount} sur {data.length} sélectionné(s)
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-gris-950">
                {editingId ? 'Modifier le kourel' : 'Nouveau kourel'}
              </SheetTitle>
              <p className="text-sm text-gris-500 mt-1">
                {editingId ? 'Modifiez les informations du kourel' : 'Ajoutez un nouveau kourel au programme'}
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <KourelForm data={form} onChange={setForm} />
          </div>

          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 rounded-lg">
                Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.nom || !form.responsable || saving} className="flex-1 gap-1.5 rounded-lg">
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : 'Créer le kourel'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Désactiver le kourel"
        description="Cette action est irréversible. Le kourel ne sera plus visible pour les membres, mais l'historique sera conservé."
        itemName={deleteDialog.item?.nom}
        onConfirm={confirmerSuppression}
        loading={deleteDialog.loading}
      />
    </div>
  )
}
