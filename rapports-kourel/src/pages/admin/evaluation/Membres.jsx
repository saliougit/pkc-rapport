import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, Search, Users } from 'lucide-react'
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
  getPaginationRowModel, getFilteredRowModel, useReactTable,
} from '@tanstack/react-table'
import { fetchMembres, ajouterMembre, modifierMembre, supprimerMembre, fetchKourels } from '@/lib/supabase'

export function MembresPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [kourels, setKourels] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterKourel, setFilterKourel] = useState('tous')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ prenom: '', nom: '', kourel: '', telephone: '', statut: 'actif' })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [membres, kourelData] = await Promise.all([fetchMembres(), fetchKourels()])
      setData(membres)
      setKourels(kourelData.map(k => k.nom))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filteredData = useMemo(() =>
    data.filter(m => {
      const q = `${m.prenom} ${m.nom}`.toLowerCase().includes(globalFilter.toLowerCase())
      const k = filterKourel === 'tous' || m.kourel === filterKourel
      return q && k
    }), [data, globalFilter, filterKourel])

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
      header: 'Nom complet',
      accessorFn: r => `${r.prenom} ${r.nom}`,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-vert-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-vert-800">
              {row.original.prenom[0]}{row.original.nom[0]}
            </span>
          </div>
          <p className="text-sm font-semibold text-gris-950">{row.original.prenom} {row.original.nom}</p>
        </div>
      ),
    },
    {
      header: 'Kourel',
      accessorKey: 'kourel',
      cell: ({ row }) => <p className="text-sm text-gris-700">{row.original.kourel}</p>,
    },
    {
      header: 'Téléphone',
      accessorKey: 'telephone',
      cell: ({ row }) => (
        <span className="text-sm text-gris-700">{row.original.telephone || <span className="text-gris-400">—</span>}</span>
      ),
    },
    {
      header: 'Statut',
      accessorKey: 'statut',
      cell: ({ row }) => {
        const s = row.original.statut
        return (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            s === 'actif' ? 'text-vert-700 bg-vert-50' : 'text-gris-500 bg-gris-100'
          }`}>
            {s}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const m = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(m)}
              className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
              <Edit2 size={14} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => supprimer(m)}
              className="h-8 w-8 text-gris-400 hover:text-rouge hover:bg-rouge-bg">
              <Trash2 size={14} />
            </Button>
          </div>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const ouvrirAjout = () => {
    setForm({ prenom: '', nom: '', kourel: '', telephone: '', statut: 'actif' })
    setEditingId(null)
    setSheetOpen(true)
  }
  const ouvrirEdition = (m) => {
    setForm({ prenom: m.prenom, nom: m.nom, kourel: m.kourel, telephone: m.telephone, statut: m.statut })
    setEditingId(m.id)
    setSheetOpen(true)
  }
  const sauvegarder = async () => {
    if (!form.prenom || !form.nom || !form.kourel) return
    setSaving(true)
    try {
      if (editingId) {
        await modifierMembre(editingId, form)
        setData(list => list.map(m => m.id === editingId ? { ...m, ...form } : m))
      } else {
        const newM = await ajouterMembre(form.prenom, form.nom, form.kourel, form.telephone, form.statut)
        setData(list => [...list, newM])
      }
      setSheetOpen(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }
  const supprimer = async (m) => {
    setDeleteDialog({ open: true, item: m, loading: false })
  }

  const confirmerSuppression = async () => {
    if (!deleteDialog.item) return
    setDeleteDialog(d => ({ ...d, loading: true }))
    try {
      await supprimerMembre(deleteDialog.item.id)
      setData(list => list.filter(x => x.id !== deleteDialog.item.id))
      setDeleteDialog({ open: false, item: null, loading: false })
    } catch (e) {
      console.error(e)
      setDeleteDialog(d => ({ ...d, loading: false }))
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader size={24} className="animate-spin text-gris-400" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité suivi & Évaluation', 'Membres']}
        title="Membres du comité"
        subtitle={`${data.length} membre${data.length > 1 ? 's' : ''}`}
        action={
          <Button onClick={ouvrirAjout} className="gap-1.5">
            <Plus size={15} /> Ajouter un membre
          </Button>
        }
      />

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-400" />
          <Input
            placeholder="Rechercher un membre…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterKourel} onValueChange={setFilterKourel}>
          <SelectTrigger className="h-9 text-sm w-full sm:w-56">
            <SelectValue placeholder="Tous les kourels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les kourels</SelectItem>
            {kourels.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table + pagination dans un container fixe */}
      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gris-200 overflow-hidden bg-white">
        {filteredData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Users size={36} className="mb-3 text-gris-300" />
            <p className="text-sm font-semibold text-gris-700">Aucun membre trouvé</p>
            <p className="text-xs text-gris-500 mt-1">Modifiez vos filtres ou ajoutez un membre.</p>
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

        {/* Pagination — toujours en bas */}
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
              {Object.keys(rowSelection).length > 0
                ? `${Object.keys(rowSelection).length} sélectionné(s)`
                : `${filteredData.length} membre${filteredData.length > 1 ? 's' : ''}`}
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
                {editingId ? 'Modifier le membre' : 'Nouveau membre du comité'}
              </SheetTitle>
              <p className="text-sm text-gris-500 mt-1">
                {editingId ? 'Modifiez les informations du membre' : "Ajoutez un nouveau membre au comité d'évaluation"}
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Prénom</label>
                <Input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Nom</label>
                <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Kourel d'origine</label>
              <Select value={form.kourel} onValueChange={v => setForm(f => ({ ...f, kourel: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un kourel" /></SelectTrigger>
                <SelectContent>
                  {kourels.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Téléphone</label>
              <Input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="+221 77 000 00 00" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">Statut</label>
              <Select value={form.statut} onValueChange={v => setForm(f => ({ ...f, statut: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={!form.prenom || !form.nom || !form.kourel || saving}
              className="flex-1 gap-1.5 rounded-lg"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Sauvegarder' : 'Créer le membre'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer le membre du comité"
        description="Cette action est irréversible. Le membre sera supprimé de tous les événements."
        itemName={deleteDialog.item ? `${deleteDialog.item.prenom} ${deleteDialog.item.nom}` : ''}
        onConfirm={confirmerSuppression}
        loading={deleteDialog.loading}
      />
    </div>
  )
}
