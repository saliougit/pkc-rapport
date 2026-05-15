import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { loginAdmin, resetPasswordForEmail } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function RunningShield() {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [target, setTarget] = useState({ x: 0, y: 0 })
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const threshold = 180
      if (dist < threshold) {
        setIsNear(true)
        const angle = Math.atan2(dy, dx)
        const push = (threshold - dist) * 1.2
        setTarget({ x: -Math.cos(angle) * push, y: -Math.sin(angle) * push + (push > 30 ? -20 : 0) })
      } else {
        setIsNear(false)
        setTarget({ x: 0, y: 0 })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    let raf
    const animate = () => {
      setPos(prev => ({
        x: prev.x + (target.x - prev.x) * 0.12,
        y: prev.y + (target.y - prev.y) * 0.12,
      }))
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const scale = isNear ? 0.85 : 1

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-vert-500/10 rounded-full blur-3xl" />
      </div>

      <div
        ref={ref}
        className="relative transition-transform duration-75 cursor-pointer select-none"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        }}
      >
        <div className={`relative ${isNear ? 'animate-pulse' : 'animate-float'}`}>
          <div className="w-52 h-52 md:w-60 md:h-60 rounded-3xl bg-white flex items-center justify-center shadow-2xl border border-gris-200 p-8">
            <img src="/images/logo-dmn-removebg-preview.png" alt="DMN" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-vert-500/20 blur-xl -z-10" />
        </div>
        <p className="text-center text-white/60 text-sm mt-6 font-medium tracking-wide">
          {isNear ? 'Hé ! Tu veux pas m\'attraper !' : 'Espace Administrateur'}
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-vert-800 via-vert-700 to-emerald-900 relative overflow-hidden">
        <RunningShield />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-sm">

          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-gris-200 lg:hidden">
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
                  <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">Email</label>
                  <Input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                    placeholder="admin@dmn.sn" required
                    className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700" />
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

                <Button type="submit" disabled={resetLoading}
                  className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm">
                  {resetLoading ? <><Loader size={15} className="animate-spin mr-2" />Envoi…</> : <><Mail size={15} className="mr-2" />Envoyer le lien</>}
                </Button>

                <button type="button" onClick={() => { setShowForgot(false); setResetStatus(null); setResetEmail('') }}
                  className="flex items-center justify-center gap-1.5 w-full text-xs text-gris-500 hover:text-gris-700 font-medium">
                  <ArrowLeft size={13} /> Retour à la connexion
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
                    <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">Email</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@dmn.sn" required
                      className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gris-500 uppercase tracking-wide">Mot de passe</label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                        className="h-10 text-sm border-gris-300 focus-visible:ring-vert-700 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-400 hover:text-gris-600">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setShowForgot(true)}
                      className="text-xs text-vert-700 hover:text-vert-800 hover:underline font-medium">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {error && (
                    <p className="text-xs text-rouge font-semibold bg-rouge-bg border border-rouge/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <Button type="submit" disabled={loading}
                    className="w-full h-10 bg-vert-700 hover:bg-vert-800 text-white font-semibold text-sm">
                    {loading ? <><Loader size={15} className="animate-spin mr-2" />Connexion…</> : <><ShieldCheck size={15} className="mr-2" />Se connecter</>}
                  </Button>
                </form>
              </div>

              <p className="text-center text-xs text-gris-400 mt-4">
                Retour au{' '}
                <a href="/" className="text-vert-600 hover:underline font-medium">formulaire rapport</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
