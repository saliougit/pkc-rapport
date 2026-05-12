import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { supabase, fetchProfile } from './lib/supabase'
import { AdminLayout } from './components/layout/AdminLayout'
import { PWANotification } from './components/PWANotification'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/admin/Dashboard'
import { KourelsPage } from './pages/admin/Kourels'
import { MembresPage } from './pages/admin/evaluation/Membres'
import { TypesEvenementsPage } from './pages/admin/evaluation/TypesEvenements'
import { EvenementsPage } from './pages/admin/evaluation/Evenements'
import { EvaluationsPage } from './pages/admin/evaluation/Evaluations'
import { CriteresPage } from './pages/admin/evaluation/Criteres'
import MembreView from './views/MembreView'
import EvaluationMembre from './views/EvaluationMembre'
import PublicAccueil from './views/PublicAccueil'

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gris-400">
      <div className="w-12 h-12 rounded-xl bg-gris-100 flex items-center justify-center mb-3">
        <span className="text-xl">🚧</span>
      </div>
      <p className="text-sm font-semibold text-gris-700">{title}</p>
      <p className="text-xs text-gris-400 mt-1">Cette section est en cours de développement.</p>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        try {
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        } catch { setProfile(null) }
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, s) => {
      setSession(s)
      if (s?.user) {
        try {
          const p = await fetchProfile(s.user.id)
          setProfile(p)
        } catch { setProfile(null) }
      } else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size={24} className="animate-spin text-vert-700" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <PWANotification />
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/admin" replace /> : <LoginPage />}
        />

        <Route
          path="/admin"
          element={session ? <AdminLayout user={session.user} profile={profile} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="kourels"    element={<KourelsPage />} />
          <Route path="rapports"   element={<ComingSoon title="Rapports PKC" />} />
          <Route path="programme"  element={<ComingSoon title="Programme Annuel" />} />
          <Route path="synthese"   element={<ComingSoon title="Synthèse" />} />
          <Route path="comptes-rendus" element={<ComingSoon title="Comptes rendus" />} />
          <Route path="evaluation/membres"    element={<MembresPage />} />
          <Route path="evaluation/types"      element={<TypesEvenementsPage />} />
          <Route path="evaluation/evenements" element={<EvenementsPage />} />
          <Route path="evaluation/evaluations" element={<EvaluationsPage />} />
          <Route path="evaluation/criteres"   element={<CriteresPage />} />
          <Route path="pad/sessions" element={<ComingSoon title="Sessions PAD" />} />
          <Route path="pad/rapports" element={<ComingSoon title="Rapports PAD" />} />
          <Route path="notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="*"          element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="/"          element={<PublicAccueil />} />
        <Route path="/rapport"   element={<MembreView />} />
        <Route path="/evaluer"   element={<EvaluationMembre />} />

        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
