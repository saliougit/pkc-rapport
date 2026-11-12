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
  { id: 'rapport', label: 'Rapport', icon: FileText, color: '#315F3C' },
  { id: 'evaluation', label: 'Évaluation', icon: Star, color: '#C58A36' },
]

const MOIS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

const PATTERN = (stroke) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='${stroke}' stroke-width='1'%3E%3Cpath d='M36 4 L47 15 L61 15 L61 29 L72 36 L61 43 L61 57 L47 57 L36 68 L25 57 L11 57 L11 43 L0 36 L11 29 L11 15 L25 15 Z'/%3E%3Ccircle cx='36' cy='36' r='11'/%3E%3C/g%3E%3C/svg%3E")`

function InfoCard({ title, description, note, ctaLabel, footerTag, color, children, as: Comp = 'div', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <Comp
        className="group relative block rounded-xl overflow-hidden bg-white border border-gris-100 shadow-sm hover:shadow-md transition-shadow"
        {...props}
      >
        <div className="p-5">
          <p className="font-heading font-bold text-xl text-gris-950 mb-1.5">{title}</p>
          <p className="text-sm text-gris-500 leading-relaxed mb-1">{description}</p>
          {note && <p className="text-xs text-gris-400 mb-3">{note}</p>}
          {ctaLabel && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold mt-2" style={{ color }}>
              {ctaLabel}
              <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          )}
          {children}
        </div>
        {footerTag && (
          <div className="px-5 py-2.5 border-t border-gris-100 text-[11px] font-medium text-gris-400">
            {footerTag}
          </div>
        )}
      </Comp>
    </motion.div>
  )
}

export default function PublicAccueil() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('rapport')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const now = new Date()
  const periode = `${MOIS_FR[now.getMonth()]} ${now.getFullYear()}`

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Veuillez entrer votre code d\'évaluation')
      return
    }
    navigate(`/evaluer?code=${encodeURIComponent(code.trim())}`)
  }

  return (
    <div className="relative min-h-screen bg-gris-clair flex flex-col lg:items-center lg:justify-center px-0 lg:px-4 py-0 lg:py-10">
      <motion.div
        className="relative w-full flex-1 flex flex-col lg:flex-none lg:max-w-lg lg:rounded-[1.25rem] lg:shadow-2xl lg:overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header institutionnel */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden flex flex-col items-center text-center gap-2 px-6 pt-10 pb-12 lg:pt-10 lg:pb-14"
          style={{ background: 'linear-gradient(160deg, #1B3321 0%, #24432D 55%, #315F3C 100%)' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: PATTERN('%23ffffff'), backgroundSize: '72px 72px' }}
          />

          <Link
            to="/login"
            aria-label="Se connecter en tant qu'administrateur"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <UserCog size={18} />
          </Link>

          <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center p-2.5">
            <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
          </div>
          <p className="relative z-10 font-heading font-bold text-2xl text-white leading-tight mt-2">
            Daara Madjmahoun Noreyni
          </p>
          <p className="relative z-10 text-xs text-white/55 leading-tight">
            UCAD · Pôle Kourel Centrale · Commission Conservatoire
          </p>
        </motion.div>

        {/* Onglets : Rapport / Évaluation */}
        <motion.div variants={itemVariants} className="relative z-10 -mt-5 mx-5 lg:mx-6">
          <div className="bg-white rounded-lg shadow-md border border-gris-100 p-1 flex gap-1.5">
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTab(t.id)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-semibold transition-colors hover:brightness-95"
                  style={{
                    color: active ? 'white' : '#3D4A42',
                    background: active ? 'transparent' : '#F0F2F0',
                    border: active ? 'none' : '1px solid #DDE3DF',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="public-tab-active"
                      className="absolute inset-0 rounded-md shadow-sm -z-10"
                      style={{ background: t.color }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon size={14} />
                  {t.label}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Contenu */}
        <div className="px-4 pt-6 pb-10 lg:px-6 lg:pb-8 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {tab === 'rapport' && (
              <InfoCard
                key="rapport"
                as={Link}
                to="/rapport"
                title="Rapport Mensuel"
                description="Mélodies, programme annuel et appréciation : le suivi des activités de votre kourel."
                note={`Période en cours : ${periode}`}
                ctaLabel="Accéder aux rapports"
                color="#315F3C"
              />
            )}

            {tab === 'evaluation' && (
              <InfoCard
                key="evaluation"
                title="Évaluation de prestation"
                description="Évaluez la prestation d'un kourel à l'aide du code qui vous a été communiqué."
                color="#C58A36"
              >
                <form onSubmit={handleCodeSubmit} className="relative space-y-3 mt-3">
                  <div>
                    <label className="block text-xs text-gris-400 mb-2">
                      Code d'évaluation
                    </label>
                    <div className="flex flex-col lg:flex-row gap-2.5">
                      <Input
                        value={code}
                        onChange={e => { setCode(e.target.value); setError('') }}
                        placeholder="Ex. : A7K2-B9XQ"
                        className="flex-1 h-10 text-sm rounded-lg border-gris-200 bg-gris-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#C58A36]/40"
                      />
                      <motion.button type="submit"
                        whileTap={{ scale: 0.96 }}
                        className="h-10 px-4 text-white text-sm font-semibold rounded-lg hover:brightness-95 transition flex items-center justify-center gap-1 flex-shrink-0 shadow-sm self-end lg:self-auto"
                        style={{ background: '#C58A36' }}
                      >
                        Accéder <ChevronRight size={14} />
                      </motion.button>
                    </div>
                    {error && <p className="text-xs text-rouge mt-1.5">{error}</p>}
                  </div>
                  <p className="text-[11px] text-gris-400 leading-relaxed">
                    <ShieldCheck size={11} className="inline mr-1 -mt-0.5" />
                    Code à 12 caractères. En cas de perte, contactez l'administrateur.
                  </p>
                </form>
              </InfoCard>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
