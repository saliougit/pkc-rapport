import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, Calendar, MapPin, Users } from 'lucide-react'
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

const TYPES_MOCK = ['Goudj', 'Aldiouma', 'Ziar', 'Magal']
const MEMBRES_MOCK = [
  { id: 1, nom: 'Ibrahima Fall' },
  { id: 2, nom: 'Moussa Diop' },
  { id: 3, nom: 'Abdoulaye Niang' },
  { id: 4, nom: 'Cheikh Mbaye' },
]

const FORM_VIDE = { type: '', date: '', lieu: '', evaluateurs: [] }

export function EvenementsPage() {
  const [evenements, setEvenements] = useState([
    { id: 1, type: 'Goudj', date: '2026-04-15', lieu: 'Dakar, Médina', evaluateurs: [1, 2], statut: 'terminé' },
    { id: 2, type: 'Aldiouma', date: '2026-05-02', lieu: 'Thiès Centre', evaluateurs: [2, 3], statut: 'à venir' },
    { id: 3, type: 'Magal', date: '2026-05-20', lieu: 'Touba', evaluateurs: [1, 3, 4], statut: 'à venir' },
  ])
  const [selected, setSelected] = useState(new Set())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const allSelected = evenements.length > 0 && evenements.every(e => selected.has(e.id))
  const someSelected = evenements.some(e => selected.has(e.id))

  const toggleAll = () => {
    setSelected(s => {
      const next = new Set(s)
      if (allSelected) evenements.forEach(e => next.delete(e.id))
      else evenements.forEach(e => next.add(e.id))
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

  const toggleEvaluateur = (id) => {
    setForm(f => ({
      ...f,
      evaluateurs: f.evaluateurs.includes(id)
        ? f.evaluateurs.filter(x => x !== id)
        : [...f.evaluateurs, id],
    }))
  }

  const ouvrirAjout = () => { setForm(FORM_VIDE); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (e) => {
    setForm({ type: e.type, date: e.date, lieu: e.lieu, evaluateurs: [...e.evaluateurs] })
    setEditingId(e.id)
    setSheetOpen(true)
  }

  const sauvegarder = async () => {
    if (!form.type || !form.date || !form.lieu) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    const statut = new Date(form.date) < new Date() ? 'terminé' : 'à venir'
    if (editingId) {
      setEvenements(list => list.map(e => e.id === editingId ? { ...e, ...form, statut } : e))
    } else {
      setEvenements(list => [...list, { id: Date.now(), ...form, statut }])
    }
    setSaving(false)
    setSheetOpen(false)
  }

  const supprimer = (e) => {
    if (!confirm(`Supprimer l'événement « ${e.type} » du ${formatDate(e.date)} ?`)) return
    setEvenements(list => list.filter(x => x.id !== e.id))
    setSelected(s => { const next = new Set(s); next.delete(e.id); return next })
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const getNomEvaluateurs = (ids) => ids.map(id => MEMBRES_MOCK.find(m => m.id === id)?.nom).filter(Boolean)

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Événements']}
        title="Événements réels"
        subtitle="Créés à partir des types · Avec date et lieu"
        action={
          <div className="flex items-center gap-2">
            {someSelected && (
              <span className="text-xs text-vert-700 font-semibold px-2.5 py-1 bg-vert-50 rounded-full border border-vert-200">
                {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            )}
            <Button size="sm" onClick={ouvrirAjout} className="gap-1.5 bg-vert-700 hover:bg-vert-800 text-white">
              <Plus size={15} /> Créer un événement
            </Button>
          </div>
        }
      />

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {evenements.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun événement</p>
              <p className="text-xs text-gris-500 mt-1">Créez votre premier événement.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-gris-300" />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden md:table-cell">Lieu</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden lg:table-cell">Évaluateurs</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Statut</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evenements.map(e => (
                  <TableRow key={e.id} className={`border-b border-gris-100 hover:bg-gris-50 ${selected.has(e.id) ? 'bg-vert-50/50' : ''}`}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox checked={selected.has(e.id)} onCheckedChange={() => toggleOne(e.id)} className="border-gris-300" />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{e.type}</p>
                      <p className="text-xs text-gris-500 sm:hidden">{formatDate(e.date)}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-vert-600 flex-shrink-0" />
                        {formatDate(e.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-vert-600 flex-shrink-0" />
                        {e.lieu}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-gris-400 flex-shrink-0" />
                        <span className="text-sm text-gris-700">{e.evaluateurs.length} évaluateur{e.evaluateurs.length > 1 ? 's' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={e.statut === 'terminé'
                        ? 'bg-vert-100 text-vert-800 border-0 text-[11px]'
                        : 'bg-orange-bg text-orange border-0 text-[11px]'}>
                        {e.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(e)}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(e)}
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
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-gris-950">{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4 px-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Type d'événement</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="border-gris-300">
                  <SelectValue placeholder="Choisir un type…" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_MOCK.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Lieu</label>
              <Input value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))}
                placeholder="Ville, quartier…" className="border-gris-300" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Évaluateurs assignés</label>
              <div className="space-y-2 border border-gris-200 rounded-lg p-3">
                {MEMBRES_MOCK.map(m => (
                  <label key={m.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                      checked={form.evaluateurs.includes(m.id)}
                      onCheckedChange={() => toggleEvaluateur(m.id)}
                      className="border-gris-300"
                    />
                    <span className="text-sm text-gris-700 group-hover:text-gris-950">{m.nom}</span>
                  </label>
                ))}
              </div>
              {form.evaluateurs.length > 0 && (
                <p className="text-xs text-vert-700">{form.evaluateurs.length} évaluateur{form.evaluateurs.length > 1 ? 's' : ''} sélectionné{form.evaluateurs.length > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <SheetFooter className="gap-2 pt-2 border-t border-gris-200">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700">
                <X size={14} className="mr-1.5" /> Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.type || !form.date || !form.lieu || saving}
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
