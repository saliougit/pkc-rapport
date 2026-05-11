import { useState, useEffect } from 'react'
import {
  Plus, Edit2, Trash2, Save, X, Loader,
  Users, Calendar, ClipboardList, ChevronLeft,
  Star, Phone, MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { fetchKourels } from '@/lib/supabase'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CRITERES = [
  { id: 1, nom: 'Mélodie / Phonétique' },
  { id: 2, nom: 'Timing' },
  { id: 3, nom: 'Discipline' },
  { id: 4, nom: 'Ponctualité' },
  { id: 5, nom: 'Appréciation générale' },
]

const TYPES_EVT = ['Goudj', 'Aldiouma', 'Ziar', 'Gamou', 'Autre']

// ─── Tab : Membres du Comité ──────────────────────────────────────────────────

const MEMBRE_VIDE = { prenom: '', nom: '', role: '', telephone: '', email: '' }

function MembresTab() {
  const [membres, setMembres] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(MEMBRE_VIDE)
  const [editingId, setEditingId] = useState(null)

  const ouvrirAjout = () => { setForm(MEMBRE_VIDE); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (m) => {
    setForm({ prenom: m.prenom, nom: m.nom, role: m.role, telephone: m.telephone, email: m.email })
    setEditingId(m.id)
    setSheetOpen(true)
  }

  const sauvegarder = () => {
    if (!form.prenom || !form.nom) return
    if (editingId) {
      setMembres(list => list.map(m => m.id === editingId ? { ...m, ...form } : m))
    } else {
      setMembres(list => [...list, { ...form, id: Date.now(), actif: true }])
    }
    setSheetOpen(false)
  }

  const supprimer = (id) => {
    if (!confirm('Retirer ce membre du comité ?')) return
    setMembres(list => list.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gris-500">{membres.length} membre{membres.length > 1 ? 's' : ''} dans le comité</p>
        <Button size="sm" onClick={ouvrirAjout} className="bg-vert-700 hover:bg-vert-800 text-white gap-1.5">
          <Plus size={14} /> Ajouter un membre
        </Button>
      </div>

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {membres.length === 0 ? (
            <div className="text-center py-14">
              <Users size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun membre du comité</p>
              <p className="text-xs text-gris-400 mt-1">Ajoutez les membres du comité d'évaluation.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Membre</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Rôle</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden md:table-cell">Téléphone</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membres.map((m) => (
                  <TableRow key={m.id} className="border-b border-gris-100 hover:bg-gris-50">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-vert-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-vert-800">
                            {m.prenom[0]}{m.nom[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gris-950">{m.prenom} {m.nom}</p>
                          <p className="text-xs text-gris-500 sm:hidden">{m.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden sm:table-cell">{m.role || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {m.telephone
                        ? <span className="text-sm text-gris-700 flex items-center gap-1"><Phone size={12} /> {m.telephone}</span>
                        : <span className="text-gris-300">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(m)}
                          className="h-7 w-7 text-gris-400 hover:text-bleu hover:bg-bleu-bg">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(m.id)}
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
            <SheetTitle>{editingId ? 'Modifier le membre' : 'Nouveau membre du comité'}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
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
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Rôle dans le comité</label>
              <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="ex: Évaluateur principal, Secrétaire…" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Téléphone</label>
              <Input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+221 77 000 00 00" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Email (optionnel)</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="membre@dmn.sn" className="border-gris-300" />
            </div>
          </div>
          <SheetFooter className="gap-2 border-t border-gris-200 pt-4">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700"><X size={14} className="mr-1.5" />Annuler</Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.prenom || !form.nom}
              className="bg-vert-700 hover:bg-vert-800 text-white">
              <Save size={14} className="mr-1.5" />{editingId ? 'Sauvegarder' : 'Ajouter'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Tab : Événements ─────────────────────────────────────────────────────────

const EVT_VIDE = { nom: '', type: '', date: '', lieu: '', notes: '' }

function EvenementsTab({ evenements, setEvenements }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(EVT_VIDE)
  const [editingId, setEditingId] = useState(null)

  const ouvrirAjout = () => { setForm(EVT_VIDE); setEditingId(null); setSheetOpen(true) }
  const ouvrirEdition = (e) => {
    setForm({ nom: e.nom, type: e.type, date: e.date, lieu: e.lieu || '', notes: e.notes || '' })
    setEditingId(e.id)
    setSheetOpen(true)
  }

  const sauvegarder = () => {
    if (!form.nom || !form.type || !form.date) return
    if (editingId) {
      setEvenements(list => list.map(e => e.id === editingId ? { ...e, ...form } : e))
    } else {
      setEvenements(list => [...list, { ...form, id: Date.now() }])
    }
    setSheetOpen(false)
  }

  const supprimer = (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    setEvenements(list => list.filter(e => e.id !== id))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gris-500">{evenements.length} événement{evenements.length > 1 ? 's' : ''}</p>
        <Button size="sm" onClick={ouvrirAjout} className="bg-vert-700 hover:bg-vert-800 text-white gap-1.5">
          <Plus size={14} /> Créer un événement
        </Button>
      </div>

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {evenements.length === 0 ? (
            <div className="text-center py-14">
              <Calendar size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun événement</p>
              <p className="text-xs text-gris-400 mt-1">Créez des événements de prestation (Goudj, Aldiouma…)</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Événement</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden md:table-cell">Lieu</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evenements.map((e) => (
                  <TableRow key={e.id} className="border-b border-gris-100 hover:bg-gris-50">
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{e.nom}</p>
                      <Badge className="mt-1 bg-vert-50 text-vert-800 border-0 text-[10px] font-semibold">{e.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden sm:table-cell">{formatDate(e.date)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {e.lieu
                        ? <span className="text-sm text-gris-700 flex items-center gap-1"><MapPin size={12} /> {e.lieu}</span>
                        : <span className="text-gris-300">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(e)}
                          className="h-7 w-7 text-gris-400 hover:text-bleu hover:bg-bleu-bg"><Edit2 size={13} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(e.id)}
                          className="h-7 w-7 text-gris-400 hover:text-rouge hover:bg-rouge-bg"><Trash2 size={13} /></Button>
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
            <SheetTitle>{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Nom de l'événement</label>
              <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Goudj Safar 1447" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Type</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="border-gris-300">
                  <SelectValue placeholder="Sélectionner le type…" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_EVT.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                placeholder="ex: UCAD Campus, Dakar" className="border-gris-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Notes (optionnel)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Informations complémentaires…"
                className="w-full px-3 py-2 text-sm border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vert-700/20 focus:border-vert-700 resize-none min-h-[80px]" />
            </div>
          </div>
          <SheetFooter className="gap-2 border-t border-gris-200 pt-4">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700"><X size={14} className="mr-1.5" />Annuler</Button>
            </SheetClose>
            <Button onClick={sauvegarder} disabled={!form.nom || !form.type || !form.date}
              className="bg-vert-700 hover:bg-vert-800 text-white">
              <Save size={14} className="mr-1.5" />{editingId ? 'Sauvegarder' : 'Créer'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Tab : Évaluations ────────────────────────────────────────────────────────

function NoteInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number" min="0" max="20" value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Math.min(20, Math.max(0, parseInt(e.target.value))))}
        className="w-16 h-9 px-2 text-center text-sm font-semibold border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vert-700/20 focus:border-vert-700"
        placeholder="—"
      />
      <span className="text-xs text-gris-400">/20</span>
    </div>
  )
}

function EvaluationsTab({ evenements, kourels }) {
  const [selectedEvt, setSelectedEvt] = useState(null)
  const [selectedKourel, setSelectedKourel] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [scores, setScores] = useState({}) // { [kourelId]: { [critereId]: note, commentaire } }
  const [tempScores, setTempScores] = useState({})

  const ouvrirEvaluation = (kourel) => {
    setSelectedKourel(kourel)
    const key = `${selectedEvt?.id}_${kourel.id}`
    setTempScores(scores[key] || { notes: {}, commentaire: '' })
    setSheetOpen(true)
  }

  const sauvegarderScores = () => {
    const key = `${selectedEvt?.id}_${selectedKourel?.id}`
    setScores(s => ({ ...s, [key]: tempScores }))
    setSheetOpen(false)
  }

  const getMoyenne = (kourelId) => {
    const key = `${selectedEvt?.id}_${kourelId}`
    const data = scores[key]
    if (!data?.notes) return null
    const vals = Object.values(data.notes).filter(v => v !== null && v !== undefined)
    if (vals.length === 0) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
  }

  const getStatut = (moy) => {
    if (moy === null) return null
    if (moy >= 16) return { label: 'Excellent', class: 'bg-vert-100 text-vert-800' }
    if (moy >= 12) return { label: 'Bien', class: 'bg-bleu-bg text-bleu' }
    if (moy >= 10) return { label: 'Passable', class: 'bg-orange-bg text-orange' }
    return { label: 'Insuffisant', class: 'bg-rouge-bg text-rouge' }
  }

  return (
    <div className="space-y-4">
      {/* Sélection de l'événement */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Événement à évaluer</label>
        {evenements.length === 0 ? (
          <p className="text-sm text-gris-400 italic">Créez d'abord un événement dans l'onglet "Événements".</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {evenements.map(e => (
              <button key={e.id} onClick={() => setSelectedEvt(e)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedEvt?.id === e.id
                    ? 'border-vert-600 bg-vert-50 shadow-sm'
                    : 'border-gris-200 bg-white hover:border-vert-400 hover:bg-gris-50'
                }`}>
                <p className="text-sm font-semibold text-gris-950">{e.nom}</p>
                <p className="text-xs text-gris-500 mt-0.5">
                  {e.type} · {e.date ? new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tableau des kourels à évaluer */}
      {selectedEvt && (
        <Card className="border-gris-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gris-200">
              <div>
                <p className="text-sm font-semibold text-gris-950">{selectedEvt.nom}</p>
                <p className="text-xs text-gris-500">Cliquez sur un kourel pour saisir les notes</p>
              </div>
            </div>
            {kourels.length === 0 ? (
              <div className="text-center py-10 text-gris-400">
                <p className="text-sm">Aucun kourel disponible.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                    <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Kourel</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Responsable</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Moyenne</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Évaluation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kourels.map(k => {
                    const moy = getMoyenne(k.id)
                    const statut = getStatut(moy)
                    return (
                      <TableRow key={k.id} className="border-b border-gris-100 hover:bg-gris-50">
                        <TableCell className="font-semibold text-sm text-gris-950">{k.nom}</TableCell>
                        <TableCell className="text-sm text-gris-500 hidden sm:table-cell">{k.responsable}</TableCell>
                        <TableCell>
                          {moy !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gris-950">{moy}/20</span>
                              {statut && <Badge className={`${statut.class} border-0 text-[10px] font-semibold`}>{statut.label}</Badge>}
                            </div>
                          ) : (
                            <span className="text-xs text-gris-300 italic">Non évalué</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => ouvrirEvaluation(k)}
                            className="border-vert-300 text-vert-700 hover:bg-vert-50 text-xs gap-1.5">
                            <Star size={13} />
                            {moy !== null ? 'Modifier' : 'Évaluer'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sheet saisie des notes */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Évaluation · {selectedKourel?.nom}</SheetTitle>
            <p className="text-xs text-gris-500 mt-1">{selectedEvt?.nom} · Notes sur 20</p>
          </SheetHeader>
          <div className="py-4 space-y-3">
            {CRITERES.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-4 py-2.5 border-b border-gris-100">
                <p className="text-sm font-medium text-gris-950">{c.nom}</p>
                <NoteInput
                  value={tempScores.notes?.[c.id]}
                  onChange={v => setTempScores(s => ({ ...s, notes: { ...s.notes, [c.id]: v } }))}
                />
              </div>
            ))}
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Commentaire (optionnel)</label>
              <textarea
                value={tempScores.commentaire || ''}
                onChange={e => setTempScores(s => ({ ...s, commentaire: e.target.value }))}
                placeholder="Observations du comité sur ce kourel…"
                className="w-full px-3 py-2 text-sm border border-gris-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vert-700/20 focus:border-vert-700 resize-none min-h-[80px]"
              />
            </div>
          </div>
          <SheetFooter className="gap-2 border-t border-gris-200 pt-4">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700"><X size={14} className="mr-1.5" />Annuler</Button>
            </SheetClose>
            <Button onClick={sauvegarderScores} className="bg-vert-700 hover:bg-vert-800 text-white">
              <Save size={14} className="mr-1.5" />Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function EvaluationPage() {
  const [evenements, setEvenements] = useState([])
  const [kourels, setKourels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKourels().then(setKourels).catch(() => []).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader size={22} className="animate-spin text-vert-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        breadcrumb={['Comité & Suivi', 'Évaluation']}
        title="Comité d'Évaluation"
        subtitle="Gestion des membres, des événements et des évaluations des kourels"
      />

      <Tabs defaultValue="membres" className="space-y-4">
        <TabsList className="bg-gris-100 p-1 h-auto gap-1">
          <TabsTrigger value="membres"
            className="data-[state=active]:bg-white data-[state=active]:text-vert-800 data-[state=active]:shadow-sm gap-1.5 text-sm">
            <Users size={15} /> Membres
          </TabsTrigger>
          <TabsTrigger value="evenements"
            className="data-[state=active]:bg-white data-[state=active]:text-vert-800 data-[state=active]:shadow-sm gap-1.5 text-sm">
            <Calendar size={15} /> Événements
          </TabsTrigger>
          <TabsTrigger value="evaluations"
            className="data-[state=active]:bg-white data-[state=active]:text-vert-800 data-[state=active]:shadow-sm gap-1.5 text-sm">
            <ClipboardList size={15} /> Évaluations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membres">
          <MembresTab />
        </TabsContent>

        <TabsContent value="evenements">
          <EvenementsTab evenements={evenements} setEvenements={setEvenements} />
        </TabsContent>

        <TabsContent value="evaluations">
          <EvaluationsTab evenements={evenements} kourels={kourels} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
