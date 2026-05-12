import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { loginAdmin, resetPasswordForEmail } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetStatus, setResetStatus] = useState(null)
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
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

        {showForgot ? (
          <div className="bg-white rounded-2xl border border-gris-200 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-vert-50 flex items-center justify-center">
                <Mail size={16} className="text-vert-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gris-950">Mot de passe oublié</p>
                <p className="text-xs text-gris-500">Recevoir un lien de réinitialisation</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              setResetLoading(true)
              setResetStatus(null)
              try {
                await resetPasswordForEmail(resetEmail)
                setResetStatus({ type: 'success', message: 'Lien envoyé. Vérifiez votre boîte mail.' })
              } catch (err) {
                setResetStatus({ type: 'error', message: err.message || 'Erreur lors de l\'envoi.' })
              } finally {
                setResetLoading(false)
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                  Email
                </label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="admin@dmn.sn"
                  required
                  className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700"
                />
              </div>

              {resetStatus && (
                <div className={`flex items-start gap-2 text-xs font-semibold rounded-lg px-3 py-2 ${
                  resetStatus.type === 'success'
                    ? 'text-vert-700 bg-vert-50 border border-vert-200'
                    : 'text-rouge bg-rouge-bg border border-rouge/20'
                }`}>
                  {resetStatus.type === 'success'
                    ? <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                    : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  }
                  {resetStatus.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm"
              >
                {resetLoading ? (
                  <><Loader size={15} className="animate-spin mr-2" />Envoi…</>
                ) : (
                  <><Mail size={15} className="mr-2" />Envoyer le lien</>
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setShowForgot(false); setResetStatus(null); setResetEmail('') }}
                className="flex items-center justify-center gap-1.5 w-full text-xs text-gris-500 hover:text-gris-700 font-medium"
              >
                <ArrowLeft size={13} />
                Retour à la connexion
              </button>
            </form>
          </div>
        ) : (
          <>
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-vert-700 hover:text-vert-800 hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
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
          </>
        )}
      </div>
    </div>
  )
}
