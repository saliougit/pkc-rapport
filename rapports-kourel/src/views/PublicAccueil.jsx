import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Star, ChevronRight, ShieldCheck, UserCog } from 'lucide-react'
import { Input } from '@/components/ui/input'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const TABS = [
  { id: 'rapport', label: 'Rapport', icon: FileText, color: '#016A3B' },
  { id: 'evaluation', label: 'Évaluation', icon: Star, color: '#B45309' },
]

function AccederBadge({ color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: `${color}14`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      Accéder
    </span>
  )
}

function OptionCard({ icon, iconBg, iconColor, cornerColor, title, description, badge, children, as: Comp = 'div', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Comp
        className="relative overflow-hidden block rounded-3xl p-6 bg-white shadow-sm transition-shadow hover:shadow-lg"
        {...props}
      >
        <div
          aria-hidden
          className="absolute w-24 h-24 rounded-full opacity-20 -top-8 -right-8"
          style={{ background: cornerColor, filter: 'blur(26px)' }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${iconBg}, white)`, color: iconColor }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-base font-bold text-gris-950 mb-1">{title}</p>
            <p className="text-xs text-gris-500 leading-relaxed mb-2">{description}</p>
            {badge && <AccederBadge color={iconColor} />}
          </div>
        </div>
        {children}
      </Comp>
    </motion.div>
  )
}

export default function PublicAccueil() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('rapport')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Veuillez entrer votre code d\'évaluation')
      return
    }
    navigate(`/evaluer?code=${encodeURIComponent(code.trim())}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gris-clair flex flex-col lg:items-center lg:justify-center px-0 lg:px-4 py-0 lg:py-6">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #014421 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-vert-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl hidden md:block" />

      <motion.div
        className="relative w-full flex-1 flex flex-col lg:flex-none lg:max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col items-center text-center gap-2 px-6 pt-10 pb-8 lg:pt-8 lg:rounded-t-[2rem]"
          style={{ background: 'linear-gradient(135deg, #EEF8F3 0%, #F5F3EE 60%, #EFF6FF 100%)' }}
        >
          <Link
            to="/login"
            aria-label="Se connecter en tant qu'administrateur"
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-gris-400 hover:text-vert-700 hover:bg-white/60 transition-colors"
          >
            <UserCog size={18} />
          </Link>
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-2.5">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
          </div>
          <p className="font-bold text-xl text-gris-950 leading-tight mt-2">Daara Madjmahoun Noreyni</p>
          <p className="text-xs text-gris-500 leading-tight">
            UCAD · Pôle Kourel Centrale · Commission Conservatoire
          </p>
        </motion.div>

        {/* Body */}
        <div className="bg-white lg:shadow-xl lg:rounded-b-[2rem] p-4 pt-6 lg:p-6 flex-1 flex flex-col justify-center pb-28 lg:pb-6 lg:flex-none lg:min-h-[240px]">
          <AnimatePresence mode="wait">
            {tab === 'rapport' && (
              <OptionCard
                key="rapport"
                as={Link}
                to="/rapport"
                badge
                icon={<FileText size={24} />}
                iconBg="#EEF8F3"
                iconColor="#016A3B"
                cornerColor="#3BAD72"
                title="Rapport Mensuel"
                description="Générer le rapport de suivi mensuel de votre kourel : mélodies, programme annuel, appréciation."
              />
            )}

            {tab === 'evaluation' && (
              <OptionCard
                key="evaluation"
                icon={<Star size={24} />}
                iconBg="#FFFBEB"
                iconColor="#B45309"
                cornerColor="#F59E0B"
                title="Évaluation d'événement"
                description="Noter un événement auquel vous avez été assigné comme évaluateur. Utilisez le code qui vous a été communiqué."
              >
                <form onSubmit={handleCodeSubmit} className="relative space-y-3 mt-5">
                  <div>
                    <label className="block text-xs text-gris-400 mb-2">
                      Code d'évaluation
                    </label>
                    <div className="flex flex-col lg:flex-row gap-2.5">
                      <Input
                        value={code}
                        onChange={e => { setCode(e.target.value); setError('') }}
                        placeholder="Entrez votre code…"
                        className="flex-1 h-12 text-sm font-mono tracking-wider uppercase rounded-2xl border-transparent bg-gris-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-400/40"
                      />
                      <motion.button type="submit"
                        whileTap={{ scale: 0.96 }}
                        className="w-full lg:w-auto h-12 px-6 bg-amber-600 text-white text-sm font-semibold rounded-full hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
                      >
                        Accéder <ChevronRight size={15} />
                      </motion.button>
                    </div>
                    {error && <p className="text-xs text-rouge mt-1.5">{error}</p>}
                  </div>
                  <p className="text-[10px] text-gris-400 leading-relaxed">
                    <ShieldCheck size={10} className="inline mr-0.5" />
                    Code à 12 caractères. En cas de perte, contactez l'administrateur.
                  </p>
                </form>
              </OptionCard>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom nav flottante : choix Rapport / Évaluation */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <nav className="relative flex items-center h-16 rounded-2xl bg-white shadow-xl px-2 gap-1">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-20 h-full"
              >
                <Icon size={20} className="transition-opacity duration-150" style={{ color: t.color, opacity: active ? 1 : 0.35 }} />
                <span className="text-[10px] font-semibold transition-opacity duration-150" style={{ color: t.color, opacity: active ? 1 : 0.35 }}>
                  {t.label}
                </span>

                {active && (
                  <motion.div
                    layoutId="public-limelight"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute top-0 z-0 w-11 h-[5px] rounded-full"
                    style={{ background: t.color, boxShadow: `0 50px 15px ${t.color}` }}
                  >
                    <div
                      className="absolute left-[-30%] top-[5px] w-[160%] h-14 pointer-events-none"
                      style={{
                        clipPath: 'polygon(5% 100%, 25% 0, 75% 0, 95% 100%)',
                        background: `linear-gradient(to bottom, ${t.color}33, transparent)`,
                      }}
                    />
                  </motion.div>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
