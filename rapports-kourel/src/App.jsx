import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { supabase } from './lib/supabase'
import { AdminLayout } from './components/layout/AdminLayout'
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader size={24} className="animate-spin text-vert-700" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={session ? <Navigate to="/admin" replace /> : <LoginPage />}
        />

        {/* Admin — layout avec sidebar, routes imbriquées */}
        <Route
          path="/admin"
          element={session ? <AdminLayout user={session.user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="kourels"    element={<KourelsPage />} />
          <Route path="rapports"   element={<ComingSoon title="Rapports PKC" />} />
          <Route path="programme"  element={<ComingSoon title="Programme Annuel" />} />
          <Route path="synthese"   element={<ComingSoon title="Synthèse" />} />
          <Route path="evaluation/membres"    element={<MembresPage />} />
          <Route path="evaluation/types"      element={<TypesEvenementsPage />} />
          <Route path="evaluation/evenements" element={<EvenementsPage />} />
          <Route path="evaluation/evaluations" element={<EvaluationsPage />} />
          <Route path="evaluation/criteres"   element={<CriteresPage />} />
          <Route path="notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="*"          element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Pages publiques */}
        <Route path="/"          element={<PublicAccueil />} />
        <Route path="/rapport"   element={<MembreView />} />
        <Route path="/evaluer"   element={<EvaluationMembre />} />

        {/* Redirection par défaut */}
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
