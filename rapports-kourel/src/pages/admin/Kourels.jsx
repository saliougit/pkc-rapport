import { useState, useEffect } from 'react'
import {
  Plus, Edit2, Trash2, BookOpen, Send, Save, X,
  Loader, Phone, Key, Users, ChevronLeft,
} from 'lucide-react'
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
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { PageHeader } from '@/components/layout/PageHeader'

const PAGE_SIZE = 8
import {
  fetchKourels, ajouterKourel, modifierKourel, supprimerKourel,
  fetchProgramme, ajouterKhassida, modifierKhassida, supprimerKhassida,
} from '@/lib/supabase'

// ─── Sous-vue : programme d'un kourel ────────────────────────────────────────

function GestionProgramme({ kourel, onRetour }) {
  const [programme, setProgramme] = useState([])
  const [loading, setLoading] = useState(true)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '' })
  const [enEdition, setEnEdition] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProgramme(kourel.id).then(setProgramme).finally(() => setLoading(false))
  }, [kourel.id])

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.melodie) return
    setSaving(true)
    try {
      const k = await ajouterKhassida(kourel.id, nouveau.nom, nouveau.melodie, programme.length)
      setProgramme(p => [...p, k])
      setNouveau({ nom: '', melodie: '' })
    } finally { setSaving(false) }
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      await modifierKhassida(k.id, k.nom, k.melodie)
      setProgramme(p => p.map(x => x.id === k.id ? k : x))
      setEnEdition(null)
    } finally { setSaving(false) }
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce khassida ?')) return
    await supprimerKhassida(id)
    setProgramme(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        breadcrumb={['Kourels', kourel.nom, 'Programme Annuel']}
        title={`Programme — ${kourel.nom}`}
        subtitle={`${programme.length} khassida${programme.length > 1 ? 's' : ''} · ${kourel.responsable}`}
        action={
          <Button variant="outline" size="sm" onClick={onRetour} className="gap-1.5">
            <ChevronLeft size={15} /> Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ajouter */}
        <Card className="border-gris-200 shadow-sm self-start">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gris-950 flex items-center gap-2">
              <Plus size={15} className="text-vert-700" /> Nouveau khassida
            </p>
            <Input
              placeholder="Nom du khassida"
              value={nouveau.nom}
              onChange={e => setNouveau(n => ({ ...n, nom: e.target.value }))}
              className="h-9 text-sm border-gris-300"
            />
            <Input
              placeholder="Mélodie (ex: Serigne Abdou Diop)"
              value={nouveau.melodie}
              onChange={e => setNouveau(n => ({ ...n, melodie: e.target.value }))}
              className="h-9 text-sm border-gris-300"
            />
            <Button
              onClick={ajouter}
              disabled={!nouveau.nom || !nouveau.melodie || saving}
              className="w-full bg-vert-700 hover:bg-vert-800 text-white h-9"
            >
              {saving ? <Loader size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
              Ajouter
            </Button>
          </CardContent>
        </Card>

        {/* Liste */}
        <Card className="border-gris-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gris-950 mb-3">
              Khassidas ({programme.length})
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader size={20} className="animate-spin text-gris-300" />
              </div>
            ) : programme.length === 0 ? (
              <div className="text-center py-10 text-gris-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun khassida. Ajoutez-en un ci-contre.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {programme.map((k, idx) => (
                  <div key={k.id} className="border border-gris-200 rounded-lg p-3 hover:border-vert-400 transition-colors">
                    {enEdition?.id === k.id ? (
                      <div className="space-y-2">
                        <Input value={enEdition.nom}
                          onChange={e => setEnEdition(x => ({ ...x, nom: e.target.value }))}
                          className="h-8 text-sm border-gris-300" />
                        <Input value={enEdition.melodie}
                          onChange={e => setEnEdition(x => ({ ...x, melodie: e.target.value }))}
                          className="h-8 text-sm border-gris-300" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => sauvegarderEdition(enEdition)}
                            className="bg-vert-700 hover:bg-vert-800 text-white h-8 text-xs gap-1">
                            <Save size={12} /> Sauvegarder
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEnEdition(null)} className="h-8 text-xs">
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-bold w-5 text-center text-vert-700 flex-shrink-0">{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gris-950 truncate">{k.nom}</p>
                            <p className="text-xs text-gris-500 truncate">{k.melodie}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="icon" variant="ghost" onClick={() => setEnEdition({ ...k })}
                            className="h-7 w-7 text-gris-500 hover:text-bleu hover:bg-bleu-bg">
                            <Edit2 size={13} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => supprimer(k.id)}
                            className="h-7 w-7 text-gris-500 hover:text-rouge hover:bg-rouge-bg">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Formulaire kourel (Sheet) ────────────────────────────────────────────────

function KourelForm({ data, onChange }) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Nom du kourel</label>
        <Input value={data.nom} onChange={e => onChange({ ...data, nom: e.target.value })}
          placeholder="ex: Kourel Serigne Babacar Sy" className="border-gris-300" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gris-500 uppercase tracking-wide">Responsable</label>
        <Input value={data.responsable} onChange={e => onChange({ ...data, responsable: e.target.value })}
          placeholder="Prénom Nom" className="border-gris-300" />
      </div>
      <div className="pt-2 border-t border-gris-100">
        <p className="text-xs font-semibold text-gris-500 uppercase tracking-wide mb-3">Notifications WhatsApp</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gris-700 flex items-center gap-1.5">
              <Phone size={12} className="text-vert-600" /> Téléphone
            </label>
            <Input value={data.telephone || ''} onChange={e => onChange({ ...data, telephone: e.target.value })}
              placeholder="+221 77 000 00 00" className="border-gris-300" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gris-700 flex items-center gap-1.5">
              <Key size={12} className="text-vert-600" /> Clé CallMeBot
            </label>
            <Input value={data.callmebot_apikey || ''} onChange={e => onChange({ ...data, callmebot_apikey: e.target.value })}
              placeholder="Clé API CallMeBot" className="border-gris-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

const FORM_VIDE = { nom: '', responsable: '', telephone: '', callmebot_apikey: '' }

export function KourelsPage() {
  const [kourels, setKourels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [vueProgramme, setVueProgramme] = useState(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  const totalPages = Math.ceil(kourels.length / PAGE_SIZE)
  const paginated = kourels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const allOnPageSelected = paginated.length > 0 && paginated.every(k => selected.has(k.id))
  const someOnPageSelected = paginated.some(k => selected.has(k.id))

  const toggleAll = () => {
    setSelected(s => {
      const next = new Set(s)
      if (allOnPageSelected) paginated.forEach(k => next.delete(k.id))
      else paginated.forEach(k => next.add(k.id))
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

  useEffect(() => {
    fetchKourels().then(setKourels).catch(() => setKourels([])).finally(() => setLoading(false))
  }, [])

  const ouvrirAjout = () => {
    setForm(FORM_VIDE)
    setEditingId(null)
    setSheetOpen(true)
  }

  const ouvrirEdition = (k) => {
    setForm({ nom: k.nom, responsable: k.responsable, telephone: k.telephone || '', callmebot_apikey: k.callmebot_apikey || '' })
    setEditingId(k.id)
    setSheetOpen(true)
  }

  const sauvegarder = async () => {
    if (!form.nom || !form.responsable) return
    setSaving(true)
    try {
      if (editingId) {
        await modifierKourel(editingId, form.nom, form.responsable, form.telephone, form.callmebot_apikey)
        setKourels(list => list.map(k => k.id === editingId ? { ...k, ...form } : k))
      } else {
        const k = await ajouterKourel(form.nom, form.responsable)
        setKourels(list => [...list, k])
      }
      setSheetOpen(false)
    } finally { setSaving(false) }
  }

  const supprimer = async (k) => {
    if (!confirm(`Désactiver « ${k.nom} » ? Il ne sera plus visible pour les membres.`)) return
    await supprimerKourel(k.id)
    setKourels(list => list.filter(x => x.id !== k.id))
  }

  const envoyerRappel = async (kourel = null) => {
    const cible = kourel ? `« ${kourel.nom} »` : 'tous les kourels'
    if (!confirm(`Envoyer le rappel WhatsApp à ${cible} maintenant ?`)) return
    setSaving(true)
    try {
      const res = await fetch('/api/send-rappel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kourel_id: kourel?.id || null })
      })
      const data = await res.json()
      alert(data.message || 'Rappels envoyés !')
    } catch { alert('Erreur lors de l\'envoi.') }
    finally { setSaving(false) }
  }

  if (vueProgramme) {
    return <GestionProgramme kourel={vueProgramme} onRetour={() => setVueProgramme(null)} />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Paramètres', 'Kourels']}
        title="Gestion des Kourels"
        subtitle={`${kourels.length} kourel${kourels.length > 1 ? 's' : ''} actifs`}
        action={
          <div className="flex items-center gap-2">
            {someOnPageSelected && (
              <span className="text-xs text-vert-700 font-semibold px-2.5 py-1 bg-vert-50 rounded-full border border-vert-200">
                {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => envoyerRappel(null)}
              disabled={saving}
              className="gap-1.5 border-gris-300 text-gris-700 text-xs"
            >
              <Send size={13} /> Rappel global
            </Button>
            <Button
              size="sm"
              onClick={ouvrirAjout}
              className="gap-1.5 bg-vert-700 hover:bg-vert-800 text-white"
            >
              <Plus size={15} /> Ajouter
            </Button>
          </div>
        }
      />

      <Card className="border-gris-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader size={22} className="animate-spin text-gris-300" />
            </div>
          ) : kourels.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className="mx-auto mb-3 text-gris-300" />
              <p className="text-sm font-semibold text-gris-700">Aucun kourel pour le moment</p>
              <p className="text-sm text-gris-500 mt-1">Ajoutez votre premier kourel pour commencer.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gris-50 hover:bg-gris-50 border-b border-gris-200">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Tout sélectionner"
                      className="border-gris-300"
                    />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide w-8">#</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">Kourel</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide hidden sm:table-cell">Responsable</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide">WhatsApp</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((k, idx) => (
                  <TableRow key={k.id} className={`border-b border-gris-100 hover:bg-gris-50 ${selected.has(k.id) ? 'bg-vert-50/50' : ''}`}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox
                        checked={selected.has(k.id)}
                        onCheckedChange={() => toggleOne(k.id)}
                        aria-label={`Sélectionner ${k.nom}`}
                        className="border-gris-300"
                      />
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gris-400 w-8">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-gris-950">{k.nom}</p>
                      <p className="text-xs text-gris-500 sm:hidden">{k.responsable}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gris-700 hidden sm:table-cell">{k.responsable}</TableCell>
                    <TableCell>
                      {k.telephone && k.callmebot_apikey ? (
                        <Badge className="bg-vert-100 text-vert-800 border-0 text-[11px] font-semibold">WA ✓</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gris-100 text-gris-500 border-0 text-[11px]">—</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {k.telephone && k.callmebot_apikey && (
                          <Button size="icon" variant="ghost" onClick={() => envoyerRappel(k)}
                            className="h-7 w-7 text-gris-400 hover:text-[#25D366] hover:bg-green-50" title="Rappel WhatsApp">
                            <Send size={13} />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => setVueProgramme(k)}
                          className="h-7 w-7 text-gris-400 hover:text-vert-700 hover:bg-vert-50" title="Programme annuel">
                          <BookOpen size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => ouvrirEdition(k)}
                          className="h-7 w-7 text-gris-400 hover:text-bleu hover:bg-bleu-bg" title="Modifier">
                          <Edit2 size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => supprimer(k)}
                          className="h-7 w-7 text-gris-400 hover:text-rouge hover:bg-rouge-bg" title="Désactiver">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => setPage(p)}
                  isActive={p === page}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Sheet Ajout / Édition */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-gris-950">
              {editingId ? 'Modifier le kourel' : 'Nouveau kourel'}
            </SheetTitle>
          </SheetHeader>

          <div className="px-1 py-4">
            <KourelForm data={form} onChange={setForm} />
          </div>

          <SheetFooter className="gap-2 pt-2 border-t border-gris-200">
            <SheetClose asChild>
              <Button variant="outline" className="border-gris-300 text-gris-700">
                <X size={14} className="mr-1.5" /> Annuler
              </Button>
            </SheetClose>
            <Button
              onClick={sauvegarder}
              disabled={!form.nom || !form.responsable || saving}
              className="bg-vert-700 hover:bg-vert-800 text-white"
            >
              {saving
                ? <Loader size={14} className="animate-spin mr-1.5" />
                : <Save size={14} className="mr-1.5" />}
              {editingId ? 'Sauvegarder' : 'Créer'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
