import { useState, useMemo } from 'react'
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
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel, useReactTable,
} from '@tanstack/react-table'

const KOURELS = [
  'Kourel Serigne Babacar Sy',
  'Kourel Serigne Moussa Ka',
  'Kourel El Hadj Malick Sy',
  'Kourel Mame Thierno',
]

export function MembresPage() {
  const [data, setData] = useState([
    { id: 1, prenom: 'Ibrahima',  nom: 'Fall',  kourel: 'Kourel Serigne Babacar Sy', telephone: '+221 77 000 00 01', statut: 'actif' },
    { id: 2, prenom: 'Moussa',    nom: 'Diop',  kourel: 'Kourel El Hadj Malick Sy',  telephone: '+221 77 000 00 02', statut: 'actif' },
    { id: 3, prenom: 'Abdoulaye', nom: 'Niang', kourel: 'Kourel Serigne Moussa Ka',  telephone: '',                  statut: 'inactif' },
    { id: 4, prenom: 'Cheikh',    nom: 'Mbaye', kourel: 'Kourel Mame Thierno',       telephone: '+221 77 000 00 04', statut: 'actif' },
    { id: 5, prenom: 'Fatou',     nom: 'Sow',   kourel: 'Kourel Serigne Babacar Sy', telephone: '+221 77 000 00 05', statut: 'actif' },
  ])
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterKourel, setFilterKourel] = useState('tous')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ prenom: '', nom: '', kourel: '', telephone: '', statut: 'actif' })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

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
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 8 } },
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
    await new Promise(r => setTimeout(r, 300))
    if (editingId) setData(list => list.map(m => m.id === editingId ? { ...m, ...form } : m))
    else setData(list => [...list, { id: Date.now(), ...form }])
    setSaving(false)
    setSheetOpen(false)
  }
  const supprimer = (m) => {
    if (!confirm(`Supprimer ${m.prenom} ${m.nom} ?`)) return
    setData(list => list.filter(x => x.id !== m.id))
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Membres']}
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
            {KOURELS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
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
          <p className="text-xs text-gris-500">
            {Object.keys(rowSelection).length > 0
              ? `${Object.keys(rowSelection).length} sélectionné(s)`
              : `${filteredData.length} membre${filteredData.length > 1 ? 's' : ''}`}
          </p>
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
        <SheetContent className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <SheetTitle className="text-lg font-bold text-gris-950">
              {editingId ? 'Modifier le membre' : 'Nouveau membre du comité'}
            </SheetTitle>
            <p className="text-sm text-gris-500">
              {editingId ? 'Modifiez les informations du membre' : "Ajoutez un nouveau membre au comité d'évaluation"}
            </p>
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
                  {KOURELS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
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
              <Button variant="outline" className="flex-1 gap-1.5 rounded-lg">
                <X size={14} /> Annuler
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
    </div>
  )
}
