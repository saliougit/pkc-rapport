import { useState, useMemo, useEffect } from 'react'
import { fetchCriteres, ajouterCritere, modifierCritere, supprimerCritere } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Loader, GripVertical, ChevronDown, ChevronRight, Info } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, useReactTable,
} from '@tanstack/react-table'

const APPRECIATIONS = ['Mauvais', 'Médiocre', 'Passable', 'Bien', 'Très bien', 'Excellent']

const SECTION_COLORS = [
  'bg-blue-50 border-blue-200',
  'bg-purple-50 border-purple-200',
  'bg-amber-50 border-amber-200',
  'bg-orange-50 border-orange-200',
  'bg-rose-50 border-rose-200',
  'bg-vert-50 border-vert-200',
  'bg-gris-50 border-gris-200',
  'bg-indigo-50 border-indigo-200',
]

function SectionCard({ section, onEdit, onDelete }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="group rounded-xl border border-gris-200 bg-white shadow-sm hover:shadow-md hover:border-gris-300 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gris-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${section.couleur} flex items-center justify-center`}>
            <span className="text-sm font-bold text-gris-700">{section.ordre}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gris-950 line-clamp-1">{section.nom}</p>
            <p className="text-xs text-gris-500 line-clamp-1">{section.description || 'Sans description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <Badge variant="secondary" className="text-xs font-medium whitespace-nowrap">
            {section.criteres.length} critère{section.criteres.length > 1 ? 's' : ''}
          </Badge>
          {open ? <ChevronDown size={18} className="text-gris-400" /> : <ChevronRight size={18} className="text-gris-400" />}
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-gris-100 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {section.criteres.length > 0 ? (
              section.criteres.map(critere => (
                <div key={critere.id}
                  className="flex flex-col bg-gris-50/50 rounded-lg px-4 py-3 border border-gris-100 hover:bg-gris-100/50 transition-colors group/item"
                >
                  <div className="flex-1 min-w-0 mb-3">
                    <p className="text-sm font-medium text-gris-900">{critere.nom}</p>
                    {critere.description && <p className="text-xs text-gris-500 line-clamp-1">{critere.description}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gris-400">/10</span>
                    <Button size="icon" variant="ghost"
                      className="h-8 w-8 text-gris-400 hover:text-vert-700 hover:bg-vert-50"
                      onClick={(e) => { e.stopPropagation(); onEdit(section) }}
                    >
                      <Edit2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gris-500">
                <p className="text-sm">Aucun critère ajouté</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gris-100 flex-wrap gap-y-2">
            <Button size="sm" variant="outline"
              className="text-xs rounded-lg h-8 gap-1.5"
              onClick={(e) => { e.stopPropagation(); onEdit(section) }}
            >
              <Plus size={13} /> Ajouter un critère
            </Button>
            <Button size="sm" variant="ghost"
              className="text-xs bg-rouge/30 text-rouge hover:bg-rouge hover:text-white rounded-lg h-8 gap-1.5 transition-all duration-200"
              onClick={(e) => { e.stopPropagation(); onDelete(section.id) }}
            >
              <Trash2 size={13} /> Supprimer
            </Button>
          </div>m
        </div>
      )}
    </div>
  )
}

export function CriteresPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [form, setForm] = useState({
    nom: '', description: '',
    criteres: [{ nom: '', description: '', note_max: '10' }],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const crits = await fetchCriteres()
      setSections(crits.map((c, i) => ({
        id: String(c.id),
        nom: c.section_nom,
        description: c.description || '',
        couleur: SECTION_COLORS[i % SECTION_COLORS.length],
        ordre: c.ordre,
        criteres: [{
          id: 'c' + c.id,
          nom: c.section_nom,
          description: c.description || '',
          note_max: 10,
        }],
      })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const ouvrirAjout = () => {
    setForm({ nom: '', description: '', criteres: [{ nom: '', description: '', note_max: '10' }] })
    setEditingSectionId(null)
    setSheetOpen(true)
  }
  const ouvrirEdition = (section) => {
    setForm({
      nom: section.nom,
      description: section.description,
      criteres: section.criteres.map(c => ({ nom: c.nom, description: c.description, note_max: String(c.note_max) })),
    })
    setEditingSectionId(section.id)
    setSheetOpen(true)
  }

  const ajouterCritereForm = () => {
    setForm(f => ({ ...f, criteres: [...f.criteres, { nom: '', description: '', note_max: '10' }] }))
  }
  const supprimerCritereForm = (idx) => {
    setForm(f => ({ ...f, criteres: f.criteres.filter((_, i) => i !== idx) }))
  }
  const updateCritereForm = (idx, field, value) => {
    setForm(f => ({
      ...f,
      criteres: f.criteres.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }))
  }

  const sauvegarder = async () => {
    if (!form.nom) return
    setSaving(true)
    try {
      if (editingSectionId) {
        await modifierCritere(Number(editingSectionId), { section_nom: form.nom, description: form.description })
        loadData()
      } else {
        await ajouterCritere(form.nom, form.description)
        loadData()
      }
      setSheetOpen(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const supprimerSection = async (id) => {
    const s = sections.find(x => x.id === id)
    if (!s || !confirm(`Supprimer la section « ${s.nom} » ?`)) return
    try {
      await supprimerCritere(Number(id))
      loadData()
    } catch (e) { console.error(e) }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité suivi & Évaluation', 'Critères']}
        title="Sections et critères d'évaluation"
        subtitle={`${sections.length} sections`}
        action={
          <Button onClick={ouvrirAjout} className="gap-1.5">
            <Plus size={15} /> Ajouter une section
          </Button>
        }
      />

      <div className="space-y-4 mb-6">
        {sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            onEdit={ouvrirEdition}
            onDelete={supprimerSection}
          />
        ))}
        {sections.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gris-200 rounded-xl bg-gris-50/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gris-100 mb-4">
              <ChevronDown size={24} className="text-gris-400" />
            </div>
            <p className="text-sm font-semibold text-gris-700">Aucune section définie</p>
            <p className="text-xs text-gris-500 mt-1">Créez des sections pour organiser vos critères d'évaluation.</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-vert-200 bg-gradient-to-br from-vert-50 to-vert-100/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-vert-700 flex-shrink-0" />
          <p className="text-xs font-bold text-vert-900 uppercase tracking-wider">Structure d'évaluation</p>
        </div>
        <p className="text-sm text-vert-800 leading-relaxed">
          Chaque évaluateur attribue pour chaque section : une <strong>appréciation</strong> (Mauvais à Excellent),
          des <strong>remarques</strong> (texte libre), et une <strong>note</strong> /10.
          Une appréciation générale avec note finale conclut l'évaluation.
        </p>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          className="w-full sm:max-w-lg bg-white p-0 flex flex-col h-full"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100 flex-shrink-0">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-gris-950">
                {editingSectionId ? 'Modifier la section' : 'Nouvelle section'}
              </SheetTitle>
              <p className="text-sm text-gris-500 mt-1">
                {editingSectionId ? 'Modifiez les critères de cette section' : 'Ajoutez une section avec ses critères'}
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                Nom de la section
              </Label>
              <Input
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Maitrise de la mélodie"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez ce que cette section évalue…"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gris-500 uppercase tracking-wider">
                  Critères ({form.criteres.length})
                </Label>
                <Button size="sm" variant="outline" onClick={ajouterCritereForm}
                  className="h-7 text-xs gap-1">
                  <Plus size={12} /> Ajouter
                </Button>
              </div>

              {form.criteres.map((c, idx) => (
                <div key={idx} className="border border-gris-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gris-500">Critère {idx + 1}</span>
                    {form.criteres.length > 1 && (
                      <Button size="icon" variant="ghost"
                        className="h-6 w-6 text-gris-400 hover:text-rouge"
                        onClick={() => supprimerCritereForm(idx)}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gris-600">Nom</Label>
                    <Input
                      value={c.nom}
                      onChange={e => updateCritereForm(idx, 'nom', e.target.value)}
                      placeholder="ex: Qualité mélodique"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gris-600">Description</Label>
                    <Input
                      value={c.description}
                      onChange={e => updateCritereForm(idx, 'description', e.target.value)}
                      placeholder="Optionnelle"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gris-600">Note max</Label>
                    <Input
                      type="number" min="1" max="100"
                      value={c.note_max}
                      onChange={e => updateCritereForm(idx, 'note_max', e.target.value)}
                      className="h-8 text-sm w-24"
                    />
                  </div>
                </div>
              ))}
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
              disabled={!form.nom || saving}
              className="flex-1 gap-1.5 rounded-lg"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {editingSectionId ? 'Sauvegarder' : 'Créer la section'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
