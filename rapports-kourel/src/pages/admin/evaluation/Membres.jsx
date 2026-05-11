import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Save, X, Loader, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

const KOURELS_MOCK = [
  'Kourel Serigne Babacar Sy',
  'Kourel Serigne Moussa Ka',
  'Kourel El Hadj Malick Sy',
  'Kourel Mame Thierno',
]

const FORM_VIDE = { prenom: '', nom: '', kourel: '', telephone: '', statut: 'actif' }

export function MembresPage() {
  const [membres, setMembres] = useState([
    { id: 1, prenom: 'Ibrahima', nom: 'Fall', kourel: 'Kourel Serigne Babacar Sy', telephone: '+221 77 000 00 01', statut: 'actif' },
    { id: 2, prenom: 'Moussa', nom: 'Diop', kourel: 'Kourel El Hadj Malick Sy', telephone: '+221 77 000 00 02', statut: 'actif' },
    { id: 3, prenom: 'Abdoulaye', nom: 'Niang', kourel: 'Kourel Serigne Moussa Ka', telephone: '', statut: 'inactif' },
  ])
  const [search, setSearch] = useState('')
  const [filterKourel, setFilterKourel] = useState('tous')
  const [selected, setSelected] = useState(new Set())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = membres.filter(m => {
    const matchSearch = `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
    const matchKourel = filterKourel === 'tous' || m.kourel === filterKourel
    return matchSearch && matchKourel
  })

  const allSelected = filtered.length > 0 && filtered.every(m => selected.has(m.id))
  const someSelected = filtered.some(m => selected.has(m.id))

  const toggleAll = () => {
    setSelected(s => {
      const next = new Set(s)
      if (allSelected) filtered.forEach(m => next.delete(m.id))
      else filtered.forEach(m => next.add(m.id))
      return next
    })
  }

  const toggleOne = (id) => {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const ouvrirAjout = () => { setForm(FORM_VIDE); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (m) => {
    setForm({ prenom: m.prenom, nom: m.nom, kourel: m.kourel, telephone: m.telephone, statut: m.statut })
    setEditingId(m.id)
    setSheetOpen(true)
  }

  const sauvegarder = async () => {
    if (!form.prenom || !form.nom || !form.kourel) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    if (editingId) {
      setMembres(list => list.map(m => m.id === editingId ? { ...m, ...form } : m))
    } else {
      setMembres(list => [...list, { id: Date.now(), ...form }])
    }
    setSaving(false)
    setSheetOpen(false)
  }

  const supprimer = (m) => {
    if (!confirm(`Supprimer ${m.prenom} ${m.nom} ?`)) return
    setMembres(list => list.filter(x => x.id !== m.id))
    setSelected(s => { const next = new Set(s); next.delete(m.id); return next })
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Membres']}
        title="Membres du comité"
        subtitle={`${membres.length} membre${membres.length > 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            {someSelected && (
              <span className="text-xs text-vert-700 font-semibold px-2.5 py-1 bg-vert-50 rounded-full border border-vert-200">
                {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            )}
            <Button size="sm" onClick={ouvrirAjout} className="gap-1.5 bg-vert-700 hover:bg-vert-800 text-white">
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        }
      />

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-400" />
          <Input
            placeholder="Rechercher un membre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-gris-300"
          />
        </div>
        <Select value={filterKourel} onValueChange={setFilterKourel}>
          <SelectTrigger className="h-9 text-sm border-gris-300 w-full sm:w-64">
            <SelectValue placeholder="Tous les kourels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les kourels</SelectItem>
            {KOURELS_MOCK.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun membre trouvé</p>
              <p className="text-xs text-gris-500 mt-1">Modifiez vos filtres ou ajoutez un membre.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-gris-300" />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Nom complet</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden md:table-cell">Kourel d'origine</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Téléphone</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Statut</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id} className={`border-b border-gris-100 hover:bg-gris-50 ${selected.has(m.id) ? 'bg-vert-50/50' : ''}`}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleOne(m.id)} className="border-gris-300" />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{m.prenom} {m.nom}</p>
                      <p className="text-xs text-gris-500 md:hidden truncate">{m.kourel}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden md:table-cell max-w-[200px] truncate">{m.kourel}</TableCell>
                    <TableCell className="text-sm text-gris-700 hidden sm:table-cell">
                      {m.telephone || <span className="text-gris-400">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={m.statut === 'actif'
                        ? 'bg-vert-100 text-vert-800 border-0 text-[11px]'
                        : 'bg-gris-100 text-gris-500 border-0 text-[11px]'}>
                        {m.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(m)}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(m)}
                          className="h-7 w-7 text-gris-400 hover:text-rouge hover:bg-rouge-bg">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-gris-950">{editingId ? 'Modifier le membre' : 'Nouveau membre'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4 px-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Prénom</label>
                <Input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                  placeholder="Prénom" className="border-gris-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Nom</label>
                <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Nom de famille" className="border-gris-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Kourel d'origine</label>
              <Select value={form.kourel} onValueChange={v => setForm(f => ({ ...f, kourel: v }))}>
                <SelectTrigger className="border-gris-300">
                  <SelectValue placeholder="Sélectionner un kourel" />
                </SelectTrigger>
                <SelectContent>
                  {KOURELS_MOCK.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Téléphone</label>
              <Input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+221 77 000 00 00" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Statut</label>
              <Select value={form.statut} onValueChange={v => setForm(f => ({ ...f, statut: v }))}>
                <SelectTrigger className="border-gris-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="gap-2 pt-2 border-t border-gris-200">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700">
                <X size={14} className="mr-1.5" /> Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.prenom || !form.nom || !form.kourel || saving}
              className="bg-vert-700 hover:bg-vert-800 text-white">
              {saving ? <Loader size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              {editingId ? 'Sauvegarder' : 'Créer'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
