import { useState } from 'react'
import { KeyRound, Loader, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { getCurrentUser, verifyPassword, updatePassword } from '@/lib/supabase'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChangePasswordModal({ open, onOpenChange }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [step, setStep] = useState('form')

  const resetForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setLoading(false)
    setStatus(null)
    setStep('form')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' })
      return
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      const user = await getCurrentUser()
      if (!user?.email) {
        setStatus({ type: 'error', message: 'Impossible de vérifier votre identité.' })
        setLoading(false)
        return
      }
      await verifyPassword(user.email, oldPassword)
      setStep('updating')
      await updatePassword(newPassword)
      setStatus({ type: 'success', message: 'Mot de passe modifié avec succès.' })
      setTimeout(() => { onOpenChange(false); resetForm() }, 2000)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Erreur lors du changement.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open) => {
    if (!open) {
      if (loading && step === 'updating') return
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={18} className="text-vert-700" />
            Changer le mot de passe
          </DialogTitle>
          <DialogDescription>
            Saisissez d'abord votre mot de passe actuel, puis le nouveau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 text-sm pr-10"
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

          <div className="border-t border-gris-100 pt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Nouveau mot de passe
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 text-sm"
              />
            </div>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="h-9 text-sm"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 bg-vert-700 hover:bg-vert-800 text-white text-sm"
            >
              {loading ? (
                <><Loader size={14} className="animate-spin mr-1.5" />{step === 'updating' ? 'Mise à jour…' : 'Vérification…'}</>
              ) : (
                'Modifier'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
