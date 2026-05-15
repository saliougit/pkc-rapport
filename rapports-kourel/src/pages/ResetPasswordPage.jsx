import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Loader, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase, updatePassword } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login', { replace: true })
      else setChecking(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await updatePassword(newPassword)
      setStatus({ type: 'success', message: 'Mot de passe réinitialisé avec succès.' })
      setTimeout(() => navigate('/admin', { replace: true }), 2000)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Erreur lors de la réinitialisation.' })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader size={24} className="animate-spin text-vert-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-gris-200">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gris-950">DMN Pôle Kourel</h1>
            <p className="text-sm text-gris-500 mt-0.5">Nouveau mot de passe</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gris-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-vert-50 flex items-center justify-center">
              <KeyRound size={16} className="text-vert-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gris-950">Réinitialisation</p>
              <p className="text-xs text-gris-500">Choisissez un nouveau mot de passe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Confirmer le mot de passe
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700"
              />
            </div>

            {status && (
              <div className={`flex items-start gap-2 text-xs font-semibold rounded-lg px-3 py-2 ${
                status.type === 'success'
                  ? 'text-vert-700 bg-vert-50 border border-vert-200'
                  : 'text-rouge bg-rouge-bg border border-rouge/20'
              }`}>
                {status.type === 'success'
                  ? <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                  : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                }
                {status.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm"
            >
              {loading ? (
                <><Loader size={15} className="animate-spin mr-2" />Mise à jour…</>
              ) : (
                <><KeyRound size={15} className="mr-2" />Réinitialiser</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
