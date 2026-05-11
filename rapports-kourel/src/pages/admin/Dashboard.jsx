import { useEffect, useState } from 'react'
import { Users, FileText, BookOpen, Bell, ArrowRight, Calendar, Star, ClipboardCheck, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { fetchKourels } from '@/lib/supabase'

function StatCard({ label, value, subtitle, color }) {
  return (
    <div className="border border-gris-200 rounded-lg p-4 bg-white">
      <p className="text-[11px] font-semibold text-gris-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${color || 'text-gris-950'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gris-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function QuickLink({ href, icon: Icon, title, description, soon, external }) {
  const inner = (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-gris-100 last:border-0">
      <Icon size={16} className="text-gris-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gris-950">{title}</p>
          {soon && (
            <span className="text-[9px] font-semibold text-gris-400 bg-gris-100 px-1.5 py-0.5 rounded">bientôt</span>
          )}
        </div>
        <p className="text-xs text-gris-500 truncate">{description}</p>
      </div>
      {external && <ExternalLink size={13} className="text-gris-300 flex-shrink-0" />}
      {!soon && !external && <ArrowRight size={14} className="text-gris-300 flex-shrink-0" />}
    </div>
  )

  if (soon) return inner
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gris-50 -mx-1 px-1 rounded">{inner}</a>
  return <Link to={href} className="block hover:bg-gris-50 -mx-1 px-1 rounded">{inner}</Link>
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
    <div className="max-w-4xl">
      <PageHeader
        title="Tableau de bord"
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Kourels actifs" value={loading ? '...' : kourels.length} subtitle="Pôle Kourel Centrale" />
        <StatCard label="Membres évaluateurs" value="3" subtitle="Comité S&É" color="text-blue-700" />
        <StatCard label="Événements" value="—" subtitle="Ce mois-ci" color="text-amber-700" />
        <StatCard label="Évaluations soumises" value="1" subtitle="3 en attente" color="text-vert-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-3">Gestion</h2>
          <div className="border border-gris-200 rounded-lg divide-y divide-gris-100 bg-white">
            <QuickLink href="/admin/kourels" icon={Users} title="Kourels" description={`${loading ? '...' : kourels.length} kourel(s) · Gestion et programme annuel`} />
            <QuickLink href="/admin/evaluation/membres" icon={Users} title="Membres du comité" description="Gestion des membres, rôles et statuts" />
            <QuickLink href="/admin/evaluation/types" icon={BookOpen} title="Types d'événements" description="Goudj, Aldiouma, Ziar, Magal…" />
            <QuickLink href="/admin/evaluation/criteres" icon={Star} title="Critères d'évaluation" description="Sections, appréciations et notes" />
            <QuickLink href="/admin/notifications" icon={Bell} title="Notifications" description="Rappels WhatsApp automatiques" soon />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gris-500 uppercase tracking-wider mb-3">Évaluation & Suivi</h2>
          <div className="border border-gris-200 rounded-lg divide-y divide-gris-100 bg-white">
            <QuickLink href="/admin/evaluation/evenements" icon={Calendar} title="Événements" description="Créer et gérer les instances d'évaluation" />
            <QuickLink href="/admin/evaluation/evaluations" icon={ClipboardCheck} title="Évaluations" description="Consulter les notes par événement" />
            <QuickLink href="/evaluer" icon={ExternalLink} title="Page publique d'évaluation" description="Lien direct pour les évaluateurs" external />
            <QuickLink href="/admin/synthese" icon={FileText} title="Synthèse & Rapports" description="Génération de synthèses mensuelles" soon />
            <QuickLink href="/admin/comptes-rendus" icon={FileText} title="Comptes rendus" description="Réunions et comptes rendus" soon />
          </div>
        </div>
      </div>
    </div>
  )
}
