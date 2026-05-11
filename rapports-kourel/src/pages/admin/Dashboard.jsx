import { useEffect, useState } from 'react'
import { Users, FileText, BookOpen, Bell, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { fetchKourels } from '@/lib/supabase'

function StatCard({ label, value, icon: Icon, bg, text, loading }) {
  return (
    <Card className="border-gris-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gris-500 uppercase tracking-wide mb-1">{label}</p>
            {loading
              ? <div className="h-8 w-12 bg-gris-100 rounded animate-pulse mt-1" />
              : <p className="text-2xl font-bold text-gris-950">{value}</p>
            }
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon size={19} className={text} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickLink({ href, icon: Icon, title, description, soon }) {
  const inner = (
    <Card className={`border-gris-200 shadow-sm transition-all ${soon ? 'opacity-60' : 'hover:border-vert-400 hover:shadow-md cursor-pointer'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-vert-50 flex items-center justify-center flex-shrink-0">
            <Icon size={17} className="text-vert-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gris-950">{title}</p>
              {soon && (
                <span className="text-[9px] font-semibold bg-gris-100 text-gris-500 px-1.5 py-0.5 rounded">
                  bientôt
                </span>
              )}
            </div>
            <p className="text-xs text-gris-500 truncate">{description}</p>
          </div>
          {!soon && <ArrowRight size={15} className="text-gris-300 flex-shrink-0" />}
        </div>
      </CardContent>
    </Card>
  )

  if (soon) return inner
  return <Link to={href}>{inner}</Link>
}

export function Dashboard() {
  const [kourels, setKourels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKourels()
      .then(setKourels)
      .catch(() => setKourels([]))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Tableau de bord"
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Kourels actifs"
          value={kourels.length}
          icon={Users}
          bg="bg-vert-50"
          text="text-vert-700"
          loading={loading}
        />
        <StatCard
          label="Rapports PKC"
          value="—"
          icon={FileText}
          bg="bg-bleu-bg"
          text="text-bleu"
        />
        <StatCard
          label="Khassidas"
          value="—"
          icon={BookOpen}
          bg="bg-orange-bg"
          text="text-orange"
        />
        <StatCard
          label="Notifs WA"
          value={kourels.filter(k => k.telephone && k.callmebot_apikey).length}
          icon={Bell}
          bg="bg-vert-100"
          text="text-vert-800"
          loading={loading}
        />
      </div>

      {/* Accès rapides */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gris-500 uppercase tracking-widest mb-3">
          Accès rapides
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink
            href="/admin/kourels"
            icon={Users}
            title="Gestion des Kourels"
            description={`${kourels.length} kourel${kourels.length > 1 ? 's' : ''} · CRUD + programme annuel`}
          />
          <QuickLink
            href="/admin/rapports"
            icon={FileText}
            title="Rapports PKC"
            description="Historique des rapports mensuels"
            soon
          />
          <QuickLink
            href="/admin/evaluation"
            icon={TrendingUp}
            title="Évaluation"
            description="Comité d'évaluation · Membres · Critères"
            soon
          />
          <QuickLink
            href="/admin/pad"
            icon={BookOpen}
            title="PAD · Présences"
            description="Suivi des sessions de répétition"
            soon
          />
        </div>
      </div>
    </div>
  )
}
