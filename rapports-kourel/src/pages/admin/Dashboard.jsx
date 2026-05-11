import { useEffect, useState } from 'react'
import {
  Users, FileText, BookOpen, Bell, ArrowRight,
  Calendar, Star, ClipboardCheck, ExternalLink,
  TrendingUp, Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { fetchKourels } from '@/lib/supabase'

function StatCard({ label, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-gris-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gris-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className={`text-2xl font-black leading-none ${color}`}>{value}</p>
        {subtitle && <p className="text-[11px] text-gris-400 mt-1 leading-none">{subtitle}</p>}
      </div>
    </div>
  )
}

function LinkGroup({ title, links }) {
  return (
    <div className="bg-white border border-gris-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gris-100 bg-gris-50">
        <p className="text-[11px] font-bold text-gris-500 uppercase tracking-widest">{title}</p>
      </div>
      <div className="divide-y divide-gris-100">
        {links.map((link, i) => <QuickLink key={i} {...link} />)}
      </div>
    </div>
  )
}

function QuickLink({ href, icon: Icon, title, description, soon, external }) {
  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${soon ? 'opacity-50' : 'hover:bg-gris-50 cursor-pointer'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${soon ? 'bg-gris-100' : 'bg-vert-50'}`}>
        <Icon size={15} className={soon ? 'text-gris-400' : 'text-vert-700'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gris-950 leading-tight">{title}</p>
          {soon && (
            <span className="text-[9px] font-bold text-gris-400 bg-gris-100 px-1.5 py-0.5 rounded-full tracking-wide">bientôt</span>
          )}
        </div>
        <p className="text-xs text-gris-500 truncate mt-0.5">{description}</p>
      </div>
      {!soon && (
        external
          ? <ExternalLink size={13} className="text-gris-300 flex-shrink-0" />
          : <ArrowRight size={14} className="text-gris-300 flex-shrink-0" />
      )}
    </div>
  )

  if (soon) return inner
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
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
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Kourels actifs"
          value={loading ? '…' : kourels.length}
          subtitle="Pôle Kourel Centrale"
          icon={Users}
          color="text-vert-700"
          bg="bg-vert-50"
        />
        <StatCard
          label="Évaluateurs"
          value="3"
          subtitle="Comité S&É"
          icon={Star}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <StatCard
          label="Événements"
          value="—"
          subtitle="Ce mois-ci"
          icon={Calendar}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <StatCard
          label="Évaluations"
          value="1"
          subtitle="3 en attente"
          icon={ClipboardCheck}
          color="text-purple-700"
          bg="bg-purple-50"
        />
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LinkGroup
          title="Gestion"
          links={[
            { href: '/admin/kourels',                icon: Users,         title: 'Kourels',                description: `${loading ? '…' : kourels.length} kourel(s) · Gestion et programme annuel` },
            { href: '/admin/evaluation/membres',      icon: Users,         title: 'Membres du comité',      description: 'Gestion des membres et statuts' },
            { href: '/admin/evaluation/types',        icon: BookOpen,      title: "Types d'événements",     description: 'Goudj, Aldiouma, Ziar, Magal…' },
            { href: '/admin/evaluation/criteres',     icon: Star,          title: "Critères d'évaluation",  description: 'Sections, appréciations et notes' },
            { href: '/admin/notifications',           icon: Bell,          title: 'Notifications',          description: 'Rappels WhatsApp automatiques', soon: true },
          ]}
        />

        <LinkGroup
          title="Évaluation & Suivi"
          links={[
            { href: '/admin/evaluation/evenements',  icon: Calendar,       title: 'Événements',             description: 'Créer et gérer les instances' },
            { href: '/admin/evaluation/evaluations', icon: ClipboardCheck, title: 'Évaluations',            description: 'Consulter les notes par événement' },
            { href: '/evaluer',                      icon: ExternalLink,   title: 'Page publique éval.',    description: 'Lien direct pour les évaluateurs', external: true },
            { href: '/admin/synthese',               icon: TrendingUp,     title: 'Synthèse & Rapports',    description: 'Génération de synthèses mensuelles', soon: true },
            { href: '/admin/comptes-rendus',         icon: FileText,       title: 'Comptes rendus',         description: 'Réunions et comptes rendus', soon: true },
          ]}
        />
      </div>

      {/* Activité récente — placeholder */}
      <div className="bg-white border border-gris-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gris-100 bg-gris-50 flex items-center gap-2">
          <Clock size={13} className="text-gris-400" />
          <p className="text-[11px] font-bold text-gris-500 uppercase tracking-widest">Activité récente</p>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gris-400">Aucune activité récente à afficher.</p>
        </div>
      </div>
    </div>
  )
}
