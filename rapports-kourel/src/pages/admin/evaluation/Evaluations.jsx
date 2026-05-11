import { useState } from 'react'
import { Calendar, MapPin, Users, Star, ChevronRight, Save, Loader, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import { PageHeader } from '@/components/layout/PageHeader'

const CRITERES_MOCK = ['Ponctualité', 'Qualité de récitation', 'Discipline', 'Participation']

const EVALUATIONS_MOCK = [
  {
    id: 1,
    type: 'Goudj',
    date: '2026-04-15',
    lieu: 'Dakar, Médina',
    statut: 'terminé',
    conclusion: 'Excellente prestation globale. Le kourel a montré une grande cohésion.',
    notes: [
      {
        evaluateur: 'Ibrahima Fall',
        criteres: { Ponctualité: 8, 'Qualité de récitation': 9, Discipline: 9, Participation: 10 },
        commentaire: 'Très bien organisé.',
      },
      {
        evaluateur: 'Moussa Diop',
        criteres: { Ponctualité: 7, 'Qualité de récitation': 8, Discipline: 8, Participation: 9 },
        commentaire: 'Quelques retards au début mais bonne reprise.',
      },
    ],
  },
  {
    id: 2,
    type: 'Aldiouma',
    date: '2026-05-02',
    lieu: 'Thiès Centre',
    statut: 'à venir',
    conclusion: '',
    notes: [],
  },
  {
    id: 3,
    type: 'Magal',
    date: '2026-05-20',
    lieu: 'Touba',
    statut: 'à venir',
    conclusion: '',
    notes: [],
  },
]

function NoteStars({ value, max = 10 }) {
  const pct = Math.round((value / max) * 5)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < pct ? 'fill-vert-500 text-vert-500' : 'text-gris-300'} />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-gris-700">{value}/{max}</span>
    </div>
  )
}

function ScoreGlobal({ notes }) {
  if (!notes.length) return <span className="text-xs text-gris-400 italic">En attente</span>
  const all = notes.flatMap(n => Object.values(n.criteres))
  const avg = (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={12} className={i < Math.round((avg / 10) * 5) ? 'fill-vert-500 text-vert-500' : 'text-gris-300'} />
        ))}
      </div>
      <span className="text-sm font-bold text-gris-950">{avg}/10</span>
    </div>
  )
}

export function EvaluationsPage() {
  const [evenements, setEvenements] = useState(EVALUATIONS_MOCK)
  const [selected, setSelected] = useState(null)
  const [conclusion, setConclusion] = useState('')
  const [saving, setSaving] = useState(false)

  const ouvrirDetail = (e) => {
    setSelected(e)
    setConclusion(e.conclusion || '')
  }

  const sauvegarderConclusion = async () => {
    if (!selected) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    setEvenements(list => list.map(e => e.id === selected.id ? { ...e, conclusion } : e))
    setSelected(s => ({ ...s, conclusion }))
    setSaving(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const moyenneCritere = (notes, critere) => {
    const vals = notes.map(n => n.criteres[critere]).filter(v => v != null)
    if (!vals.length) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Comité & Évaluation', 'Évaluations']}
        title="Évaluations"
        subtitle="Notes des évaluateurs · Conclusion générale"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {evenements.map(e => (
          <Card
            key={e.id}
            onClick={() => ouvrirDetail(e)}
            className="border-gris-200 shadow-sm hover:border-vert-400 hover:shadow-md cursor-pointer transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold text-gris-950">{e.type}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gris-500">
                    <Calendar size={11} />
                    <span>{formatDate(e.date)}</span>
                  </div>
                </div>
                <Badge className={e.statut === 'terminé'
                  ? 'bg-vert-100 text-vert-800 border-0 text-[11px]'
                  : 'bg-orange-bg text-orange border-0 text-[11px]'}>
                  {e.statut}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-gris-500 mb-3">
                <MapPin size={11} />
                <span>{e.lieu}</span>
              </div>

              <div className="flex items-center justify-between">
                <ScoreGlobal notes={e.notes} />
                <div className="flex items-center gap-1 text-xs text-gris-400">
                  <Users size={11} />
                  <span>{e.notes.length} note{e.notes.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              {e.conclusion && (
                <div className="mt-3 pt-3 border-t border-gris-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-vert-700 mb-1">
                    <Check size={11} /> Conclusion rédigée
                  </div>
                  <p className="text-xs text-gris-600 line-clamp-2">{e.conclusion}</p>
                </div>
              )}

              <div className="flex items-center justify-end mt-3">
                <span className="text-xs text-vert-700 font-medium flex items-center gap-1">
                  Voir détails <ChevronRight size={13} />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sheet détail */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4 border-b border-gris-200">
                <SheetTitle className="text-gris-950 flex items-start justify-between">
                  <div>
                    <span>{selected.type}</span>
                    <div className="text-sm font-normal text-gris-500 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(selected.date)}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{selected.lieu}</span>
                    </div>
                  </div>
                  <Badge className={selected.statut === 'terminé'
                    ? 'bg-vert-100 text-vert-800 border-0'
                    : 'bg-orange-bg text-orange border-0'}>
                    {selected.statut}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="py-4 space-y-6">
                {/* Notes par évaluateur */}
                <div>
                  <p className="text-xs font-semibold text-gris-500 uppercase tracking-wide mb-3">
                    Notes des évaluateurs ({selected.notes.length})
                  </p>
                  {selected.notes.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gris-200 rounded-lg">
                      <Star size={28} className="mx-auto mb-2 text-gris-300" />
                      <p className="text-sm text-gris-500">Aucune note pour cet événement.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selected.notes.map((n, i) => (
                        <div key={i} className="border border-gris-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gris-950 mb-3">{n.evaluateur}</p>
                          <div className="space-y-2">
                            {CRITERES_MOCK.map(c => (
                              <div key={c} className="flex items-center justify-between gap-4">
                                <span className="text-xs text-gris-600 w-36 flex-shrink-0">{c}</span>
                                <NoteStars value={n.criteres[c] ?? 0} />
                              </div>
                            ))}
                          </div>
                          {n.commentaire && (
                            <p className="text-xs text-gris-500 italic mt-3 pt-3 border-t border-gris-100">
                              « {n.commentaire} »
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Moyennes */}
                      <div className="bg-vert-50 border border-vert-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-vert-800 uppercase tracking-wide mb-3">Moyennes générales</p>
                        <div className="space-y-2">
                          {CRITERES_MOCK.map(c => {
                            const moy = moyenneCritere(selected.notes, c)
                            return (
                              <div key={c} className="flex items-center justify-between gap-4">
                                <span className="text-xs text-vert-700 w-36 flex-shrink-0">{c}</span>
                                {moy ? <NoteStars value={parseFloat(moy)} /> : <span className="text-xs text-gris-400">—</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conclusion admin */}
                <div>
                  <p className="text-xs font-semibold text-gris-500 uppercase tracking-wide mb-2">Évaluation générale (Admin)</p>
                  <textarea
                    value={conclusion}
                    onChange={e => setConclusion(e.target.value)}
                    placeholder="Rédigez ici votre évaluation globale de l'événement…"
                    rows={5}
                    className="w-full rounded-md border border-gris-300 px-3 py-2 text-sm text-gris-950 placeholder:text-gris-400 focus:outline-none focus:ring-2 focus:ring-vert-600 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <SheetFooter className="gap-2 pt-2 border-t border-gris-200">
                <SheetClose asChild>
                  <Button variant="outline" className="border-gris-300 text-gris-700">
                    <X size={14} className="mr-1.5" /> Fermer
                  </Button>
                </SheetClose>
                <Button onClick={sauvegarderConclusion} disabled={saving}
                  className="bg-vert-700 hover:bg-vert-800 text-white">
                  {saving ? <Loader size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                  Sauvegarder conclusion
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
