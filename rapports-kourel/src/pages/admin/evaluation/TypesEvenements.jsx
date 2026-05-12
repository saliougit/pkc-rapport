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
import { PageHeader } from '@/components/layout/PageHeader'
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

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
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
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
    if (!confirm(`Supprimer « ${t.nom} » ?`)) return
    try {
      await supprimerTypeEvenement(t.id)
      setData(list => list.filter(x => x.id !== t.id))
    } catch (e) { console.error(e) }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Types']}
        title="Types d'événements"
        subtitle="Modèles réutilisables (Goudj, Aldiouma, Ziar, Magal…)"
        action={
          <Button onClick={ouvrirAjout} className="gap-1.5">
            <Plus size={15} /> Ajouter un type
          </Button>
        }
      />

      <div className="rounded-lg border border-gris-200 overflow-hidden bg-white">
        {loading ? (
          <div className="text-center py-16">
            <Loader size={36} className="mx-auto mb-3 text-gris-300 animate-spin" />
            <p className="text-sm text-gris-500">Chargement…</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <ListChecks size={36} className="mx-auto mb-3 text-gris-300" />
            <p className="text-sm font-semibold text-gris-700">Aucun type d'événement</p>
            <p className="text-xs text-gris-500 mt-1">Créez des types pour organiser vos événements.</p>
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <SheetTitle className="text-lg font-bold text-gris-950">
              {editingId ? "Modifier le type" : "Nouveau type d'événement"}
            </SheetTitle>
            <p className="text-sm text-gris-500">
              {editingId ? 'Modifiez le nom et la description du type' : "Créez un nouveau type d'événement réutilisable"}
            </p>
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
              <Button variant="outline" className="flex-1 gap-1.5 rounded-lg">
                <X size={14} /> Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.nom || saving} className="flex-1 gap-1.5 rounded-lg">
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : 'Créer le type'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
