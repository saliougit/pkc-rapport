import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader, UserCheck } from 'lucide-react'
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

const FORM_VIDE = { nom: '', description: '', poids: '1', note_max: '10' }

export function CriteresPage() {
  const [criteres, setCriteres] = useState([
    { id: 1, nom: 'Ponctualité', description: 'Respect des horaires de début et de fin', poids: 1, note_max: 10 },
    { id: 2, nom: 'Qualité de récitation', description: 'Maîtrise, justesse et mélodie des khassidas', poids: 3, note_max: 10 },
    { id: 3, nom: 'Discipline', description: 'Ordre, silence et respect des règles', poids: 2, note_max: 10 },
    { id: 4, nom: 'Participation', description: 'Engagement et implication des membres', poids: 2, note_max: 10 },
  ])
  const [selected, setSelected] = useState(new Set())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const totalPoids = criteres.reduce((s, c) => s + c.poids, 0)
  const allSelected = criteres.length > 0 && criteres.every(c => selected.has(c.id))
  const someSelected = criteres.some(c => selected.has(c.id))

  const toggleAll = () => {
    setSelected(s => {
      const next = new Set(s)
      if (allSelected) criteres.forEach(c => next.delete(c.id))
      else criteres.forEach(c => next.add(c.id))
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
  const ouvrirEdition = (c) => {
    setForm({ nom: c.nom, description: c.description, poids: String(c.poids), note_max: String(c.note_max) })
    setEditingId(c.id)
    setSheetOpen(true)
  }

  const sauvegarder = async () => {
    if (!form.nom) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    const data = { ...form, poids: Number(form.poids) || 1, note_max: Number(form.note_max) || 10 }
    if (editingId) {
      setCriteres(list => list.map(c => c.id === editingId ? { ...c, ...data } : c))
    } else {
      setCriteres(list => [...list, { id: Date.now(), ...data }])
    }
    setSaving(false)
    setSheetOpen(false)
  }

  const supprimer = (c) => {
    if (!confirm(`Supprimer le critère « ${c.nom} » ?`)) return
    setCriteres(list => list.filter(x => x.id !== c.id))
    setSelected(s => { const next = new Set(s); next.delete(c.id); return next })
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Critères']}
        title="Critères d'évaluation"
        subtitle={`${criteres.length} critère${criteres.length > 1 ? 's' : ''} · Poids total : ${totalPoids}`}
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
          {criteres.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun critère défini</p>
              <p className="text-xs text-gris-500 mt-1">Créez les critères utilisés pour évaluer les événements.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-gris-300" />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Critère</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-center">Poids</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-center">Note max</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteres.map(c => (
                  <TableRow key={c.id} className={`border-b border-gris-100 hover:bg-gris-50 ${selected.has(c.id) ? 'bg-vert-50/50' : ''}`}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleOne(c.id)} className="border-gris-300" />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{c.nom}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gris-600 hidden sm:table-cell max-w-xs">
                      <p className="line-clamp-2">{c.description || <span className="text-gris-400 italic">—</span>}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-vert-100 text-vert-800 text-xs font-bold">
                        {c.poids}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-gris-700">/{c.note_max}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(c)}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(c)}
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
            <SheetTitle className="text-gris-950">{editingId ? 'Modifier le critère' : 'Nouveau critère'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4 px-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Nom du critère</label>
              <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Qualité de récitation" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez ce que ce critère évalue…"
                rows={3}
                className="w-full rounded-md border border-gris-300 px-3 py-2 text-sm text-gris-950 placeholder:text-gris-400 focus:outline-none focus:ring-2 focus:ring-vert-600 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Poids</label>
                <Input
                  type="number" min="1" max="10"
                  value={form.poids}
                  onChange={e => setForm(f => ({ ...f, poids: e.target.value }))}
                  placeholder="1"
                  className="border-gris-300"
                />
                <p className="text-[11px] text-gris-400">Importance relative</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Note max</label>
                <Input
                  type="number" min="1" max="100"
                  value={form.note_max}
                  onChange={e => setForm(f => ({ ...f, note_max: e.target.value }))}
                  placeholder="10"
                  className="border-gris-300"
                />
                <p className="text-[11px] text-gris-400">Valeur maximale</p>
              </div>
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
