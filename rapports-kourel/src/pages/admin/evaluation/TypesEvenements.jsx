import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, ListChecks } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

const FORM_VIDE = { nom: '', description: '' }

export function TypesEvenementsPage() {
  const [types, setTypes] = useState([
    { id: 1, nom: 'Goudj', description: 'Récitation collective de khassidas lors de rencontres spirituelles' },
    { id: 2, nom: 'Aldiouma', description: 'Rassemblement du vendredi après la prière de Djumu\'a' },
    { id: 3, nom: 'Ziar', description: 'Visite spirituelle chez un guide ou dans une famille Tidiane' },
    { id: 4, nom: 'Magal', description: 'Célébration commémorative d\'un événement religieux majeur' },
  ])
  const [selected, setSelected] = useState(new Set())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const allSelected = types.length > 0 && types.every(t => selected.has(t.id))
  const someSelected = types.some(t => selected.has(t.id))

  const toggleAll = () => {
    setSelected(s => {
      const next = new Set(s)
      if (allSelected) types.forEach(t => next.delete(t.id))
      else types.forEach(t => next.add(t.id))
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
  const ouvrirEdition = (t) => { setForm({ nom: t.nom, description: t.description }); setEditingId(t.id); setSheetOpen(true) }

  const sauvegarder = async () => {
    if (!form.nom) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    if (editingId) {
      setTypes(list => list.map(t => t.id === editingId ? { ...t, ...form } : t))
    } else {
      setTypes(list => [...list, { id: Date.now(), ...form }])
    }
    setSaving(false)
    setSheetOpen(false)
  }

  const supprimer = (t) => {
    if (!confirm(`Supprimer le type « ${t.nom} » ?`)) return
    setTypes(list => list.filter(x => x.id !== t.id))
    setSelected(s => { const next = new Set(s); next.delete(t.id); return next })
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Types d\'événements']}
        title="Types d'événements"
        subtitle="Modèles réutilisables · Sans dates"
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

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {types.length === 0 ? (
            <div className="text-center py-16">
              <ListChecks size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun type d'événement</p>
              <p className="text-xs text-gris-500 mt-1">Créez des types pour organiser vos événements.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-gris-300" />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Nom</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map(t => (
                  <TableRow key={t.id} className={`border-b border-gris-100 hover:bg-gris-50 ${selected.has(t.id) ? 'bg-vert-50/50' : ''}`}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleOne(t.id)} className="border-gris-300" />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{t.nom}</p>
                      <p className="text-xs text-gris-500 sm:hidden line-clamp-1">{t.description}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gris-600 hidden sm:table-cell max-w-xs">
                      <p className="line-clamp-2">{t.description || <span className="text-gris-400 italic">Aucune description</span>}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(t)}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(t)}
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
            <SheetTitle className="text-gris-950">{editingId ? 'Modifier le type' : 'Nouveau type d\'événement'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4 px-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Nom du type</label>
              <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Goudj, Magal, Aldiouma…" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description de ce type d'événement…"
                rows={4}
                className="w-full rounded-md border border-gris-300 px-3 py-2 text-sm text-gris-950 placeholder:text-gris-400 focus:outline-none focus:ring-2 focus:ring-vert-600 focus:border-transparent resize-none"
              />
            </div>
          </div>
          <SheetFooter className="gap-2 pt-2 border-t border-gris-200">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700">
                <X size={14} className="mr-1.5" /> Annuler
              </Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.nom || saving} className="bg-vert-700 hover:bg-vert-800 text-white">
              {saving ? <Loader size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
              {editingId ? 'Sauvegarder' : 'Créer'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
