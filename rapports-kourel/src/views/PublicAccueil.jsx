import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Star, ChevronRight, ShieldCheck, Loader } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function PublicAccueil() {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-gris-clair flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="bg-vert-800 text-white px-5 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 flex-shrink-0">
              <img src="/images/logo-dmn.png" alt="DMN" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight">Daara Madjmahoun Noreyni</p>
              <p className="text-[11px] text-vert-200 leading-tight">
                UCAD · Pôle Kourel Centrale · Commission Conservatoire
              </p>
            </div>
            <Link to="/login"
              className="ml-auto text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#8CD2B4' }}
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white shadow-xl rounded-b-2xl p-6 space-y-5">
          <p className="text-xs font-bold text-vert-800 uppercase tracking-widest text-center">
            Espace Membre
          </p>

          {/* Option 1 : Rapport Mensuel */}
          <Link to="/rapport"
            className="block group border border-gris-200 rounded-xl p-5 hover:border-vert-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-vert-50 flex items-center justify-center flex-shrink-0 group-hover:bg-vert-100 transition-colors">
                <FileText size={22} className="text-vert-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gris-950">Rapport Mensuel</p>
                  <ChevronRight size={14} className="text-gris-400 group-hover:text-vert-700 transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-gris-500 leading-relaxed">
                  Générer le rapport de suivi mensuel de votre kourel :
                  mélodies, programme annuel, appréciation.
                </p>
              </div>
            </div>
          </Link>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gris-200" />
            <span className="text-[10px] font-semibold text-gris-400 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gris-200" />
          </div>

          {/* Option 2 : Évaluation avec code */}
          <div className="border border-gris-200 rounded-xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Star size={22} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gris-950">Évaluation d'événement</p>
                <p className="text-xs text-gris-500 leading-relaxed">
                  Noter un événement auquel vous avez été assigné comme évaluateur.
                  Utilisez le code qui vous a été communiqué.
                </p>
              </div>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gris-500 mb-1.5 uppercase tracking-wide">
                  Code d'évaluation
                </label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={e => { setCode(e.target.value); setError('') }}
                    placeholder="Entrez votre code…"
                    className="flex-1 h-10 text-sm font-mono tracking-wider uppercase"
                  />
                  <button type="submit"
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    Accéder <ChevronRight size={15} />
                  </button>
                </div>
                {error && <p className="text-xs text-rouge mt-1.5">{error}</p>}
              </div>
              <p className="text-[10px] text-gris-400 leading-relaxed">
                <ShieldCheck size={10} className="inline mr-0.5" />
                Code à 8 caractères. En cas de perte, contactez l'administrateur.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
