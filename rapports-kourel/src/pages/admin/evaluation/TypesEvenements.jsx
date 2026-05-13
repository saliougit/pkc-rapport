import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, ListChecks } from 'lucide-react'
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
import { fetchTypesEvenements, ajouterTypeEvenement, modifierTypeEvenement, supprimerTypeEvenement } from '@/lib/supabase'

export function TypesEvenementsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const types = await fetchTypesEvenements()
      setData(types)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
      header: 'Nom',
      accessorKey: 'nom',
      cell: ({ row }) => <p className="text-sm font-semibold text-gris-950">{row.original.nom}</p>,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => (
        <span className="text-sm text-gris-600">{row.original.description || <span className="text-gris-400 italic">—</span>}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(t)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
              <Edit2 size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => supprimer(t)}
              className="h-8 w-8 text-gris-400 hover:text-rouge hover:bg-rouge-bg">
              <Trash2 size={14} />
            </Button>
          </div>
        )
      },
    },
  ], [])

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

  const ouvrirAjout = () => { setForm({ nom: '', description: '' }); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (t) => { setForm({ nom: t.nom, description: t.description }); setEditingId(t.id); setSheetOpen(true) }
  const sauvegarder = async () => {
    if (!form.nom) return
    setSaving(true)
    try {
      if (editingId) {
        await modifierTypeEvenement(editingId, form.nom, form.description)
        setData(list => list.map(t => t.id === editingId ? { ...t, ...form } : t))
      } else {
        const newT = await ajouterTypeEvenement(form.nom, form.description)
        setData(list => [...list, newT])
      }
      setSheetOpen(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }
  const supprimer = async (t) => {
    setDeleteDialog({ open: true, item: t, loading: false })
  }

  const confirmerSuppression = async () => {
    if (!deleteDialog.item) return
    setDeleteDialog(d => ({ ...d, loading: true }))
    try {
      await supprimerTypeEvenement(deleteDialog.item.id)
      setData(list => list.filter(x => x.id !== deleteDialog.item.id))
      setDeleteDialog({ open: false, item: null, loading: false })
    } catch (e) {
      console.error(e)
      setDeleteDialog(d => ({ ...d, loading: false }))
    }
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Types']}
        title="Types d'événements"
        subtitle=""
        action={
          <Button onClick={ouvrirAjout} className="gap-1.5">
            <Plus size={15} /> Ajouter un type
          </Button>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gris-200 overflow-hidden bg-white">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader size={36} className="mx-auto mb-3 text-gris-300 animate-spin" />
              <p className="text-sm text-gris-500">Chargement…</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ListChecks size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun type d'événement</p>
              <p className="text-xs text-gris-500 mt-1">Créez des types pour organiser vos événements.</p>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-gris-950">
                {editingId ? "Modifier le type" : "Nouveau type d'événement"}
              </SheetTitle>
              <p className="text-sm text-gris-500 mt-1">
                {editingId ? 'Modifiez le nom et la description du type' : "Créez un nouveau type d'événement réutilisable"}
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Nom du type</label>
              <Input
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Goudj, Magal, Aldiouma…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description de ce type d'événement…"
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring resize-none"
              />
              <p className="text-xs text-gris-400">Décrivez brièvement ce type d'événement.</p>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 px-6 py-4 border-t border-gris-100 flex-shrink-0">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 rounded-lg">
                Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.nom || saving} className="flex-1 gap-1.5 rounded-lg">
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : 'Créer le type'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer le type d'événement"
        description="Cette action est irréversible. Tous les événements associés conserveront le type, mais ce type ne sera plus disponible."
        itemName={deleteDialog.item?.nom}
        onConfirm={confirmerSuppression}
        loading={deleteDialog.loading}
      />
    </div>
  )
}
