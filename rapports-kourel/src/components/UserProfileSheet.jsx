import { useState } from 'react'
import { KeyRound, LogOut, Loader, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react'
import { getCurrentUser, verifyPassword, updatePassword } from '@/lib/supabase'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const ROLE_LABELS = {
  'admin': 'Administrateur',
  'dieuwrigne': 'Comité Suivi-Éval',
  'membre': 'Membre',
}

export function UserProfileSheet({ open, onOpenChange, user, profile, onLogout }) {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const resetPasswordForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setStatus(null)
  }

  const handlePasswordSubmit = async (e) => {
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
      const currentUser = await getCurrentUser()
      if (!currentUser?.email) {
        setStatus({ type: 'error', message: 'Impossible de vérifier votre identité.' })
        setLoading(false)
        return
      }
      await verifyPassword(currentUser.email, oldPassword)
      await updatePassword(newPassword)
      setStatus({ type: 'success', message: 'Mot de passe modifié avec succès.' })
      setTimeout(() => {
        setShowChangePassword(false)
        resetPasswordForm()
      }, 1500)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Erreur lors du changement.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setShowChangePassword(false)
      resetPasswordForm()
    }
    onOpenChange(newOpen)
  }

  const initiale = (user?.email?.[0] || 'A').toUpperCase()

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gris-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-gris-950">Mon profil</SheetTitle>
            </div>
            <SheetClose className="h-8 w-8 rounded-lg hover:bg-gris-100 flex items-center justify-center text-gris-400 hover:text-gris-600" asChild>
              <button><X size={18} /></button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Infos utilisateur */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-vert-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{initiale}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gris-950 truncate">{user?.email}</p>
                <p className="text-xs text-gris-500">{ROLE_LABELS[profile?.role] || 'Admin'}</p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Section changement mot de passe */}
          {!showChangePassword ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gris-200 hover:border-vert-300 hover:bg-vert-50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-gris-100 flex items-center justify-center group-hover:bg-vert-100 transition-colors">
                <KeyRound size={16} className="text-gris-500 group-hover:text-vert-700" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-gris-950">Changer le mot de passe</p>
                <p className="text-xs text-gris-500">Modifier votre accès sécurisé</p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowChangePassword(false)
                  resetPasswordForm()
                }}
                className="flex items-center gap-2 text-xs font-medium text-gris-500 hover:text-gris-700 mb-4"
              >
                <span>← Retour</span>
              </button>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

                <Separator className="my-4" />

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
                    Confirmer le mot de passe
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
                    <span>{status.message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm"
                >
                  {loading ? (
                    <>
                      <Loader size={15} className="animate-spin mr-2" />
                      Mise à jour…
                    </>
                  ) : (
                    <>
                      <KeyRound size={15} className="mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>

        {!showChangePassword && (
          <SheetFooter className="px-6 py-4 border-t border-gris-100 mt-auto">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1">
                Fermer
              </Button>
            </SheetClose>
            <Button
              onClick={() => {
                onOpenChange(false)
                onLogout()
              }}
              variant="ghost"
              className="flex-1 text-rouge hover:bg-rouge-bg hover:text-rouge"
            >
              <LogOut size={15} className="mr-2" />
              Déconnexion
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
