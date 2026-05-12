import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader, Eye, EyeOff } from 'lucide-react'
import { loginAdmin } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginAdmin(email, password)
      navigate('/admin', { replace: true })
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + titre */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-gris-200">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gris-950">DMN Pôle Kourel </h1>
            <p className="text-sm text-gris-500 mt-0.5">Centrale · Espace Administrateur</p>
          </div>
        </div>

        {/* Carte login */}
        <div className="bg-white rounded-2xl border border-gris-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-vert-50 flex items-center justify-center">
              <ShieldCheck size={16} className="text-vert-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gris-950">Connexion</p>
              <p className="text-xs text-gris-500">Accès réservé</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@dmn.sn"
                required
                className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-400 hover:text-gris-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rouge font-semibold bg-rouge-bg border border-rouge/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm"
            >
              {loading ? (
                <>
                  <Loader size={15} className="animate-spin mr-2" />
                  Connexion…
                </>
              ) : (
                <>
                  <ShieldCheck size={15} className="mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gris-400 mt-4">
          Retour au{' '}
          <a href="/" className="text-vert-600 hover:underline font-medium">
            formulaire rapport
          </a>
        </p>
      </div>
    </div>
  )
}
