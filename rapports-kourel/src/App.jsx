import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, Edit2, ShieldCheck, Loader } from 'lucide-react'
import { FormulaireRapport } from './components/FormulaireRapport'
import { AdminPanel } from './components/AdminPanel'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  fetchKourels, fetchProgramme,
  ajouterKhassida, modifierKhassida, supprimerKhassida
} from './lib/supabase'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

function App() {
  const [etape, setEtape] = useState('accueil') // accueil, config_programme, rapport, admin
  const [sousEtape, setSousEtape] = useState(1)

  // Kourels depuis Supabase
  const [kourels, setKourels] = useState([])
  const [loadingKourels, setLoadingKourels] = useState(true)

  // Kourel sélectionné
  const [kourelSelectionne, setKourelSelectionne] = useLocalStorage('kourel_selectionne', null)
  const [autreKourel, setAutreKourel] = useLocalStorage('kourel_autre', { nom: '', responsable: '' })

  // Programme annuel depuis Supabase (par kourel)
  const [programmeAnnuel, setProgrammeAnnuel] = useState([])
  const [loadingProgramme, setLoadingProgramme] = useState(false)

  // Chargement initial des kourels
  useEffect(() => {
    fetchKourels()
      .then(setKourels)
      .catch(() => setKourels([]))
      .finally(() => setLoadingKourels(false))
  }, [])

  // Chargement du programme quand un kourel est sélectionné
  useEffect(() => {
    if (!kourelSelectionne || kourelSelectionne === 'autre') {
      setProgrammeAnnuel([])
      return
    }
    setLoadingProgramme(true)
    fetchProgramme(kourelSelectionne)
      .then(setProgrammeAnnuel)
      .catch(() => setProgrammeAnnuel([]))
      .finally(() => setLoadingProgramme(false))
  }, [kourelSelectionne])
  
  // Données du rapport mensuel - avec localStorage
  const [rapport, setRapport] = useLocalStorage('rapport_actuel', {
    mois: '',
    annee: new Date().getFullYear(),
    date_rapport: new Date().toISOString().split('T')[0],
    representant: '',
    melodies: [],
    programme_annuel_etat: [],
    programme_annuel_textes: {
      objectifs_atteints: '',
      objectifs_en_cours: '',
      objectifs_non_atteints: '',
      ajustements: ''
    },
    appreciation: {
      generale: '',
      points_positifs: '',
      a_surveiller: '',
      en_retard: '',
      priorites: ''
    }
  })
  
  const getKourelActuel = () => {
    if (kourelSelectionne === 'autre') return autreKourel
    return kourels.find(k => k.id === kourelSelectionne)
  }
  
  const calculTaux = (mode, data) => {
    if (mode === 'pages') {
      return Math.round((data.pages_faites / data.pages_total) * 100)
    } else {
      return Math.round((data.dadj_completes.length / data.dadj_total) * 100)
    }
  }
  
  const calculStatut = (taux) => {
    if (taux >= 80) return { label: 'Bon avancement', color: 'vert' }
    if (taux >= 50) return { label: 'À suivre', color: 'orange' }
    return { label: 'Retard', color: 'rouge' }
  }
  
  const calculStatsProgamme = () => {
    const getEtatK = (id) => rapport.programme_annuel_etat.find(e => e.khassida_id === id)

    const termines     = programmeAnnuel.filter(k => getEtatK(k.id)?.statut === 'termine').length
    const enCours      = programmeAnnuel.filter(k => getEtatK(k.id)?.statut === 'en_cours').length
    const pasCommences = programmeAnnuel.filter(k => {
      const e = getEtatK(k.id)
      return !e || e.statut === 'pas_commence'
    }).length

    let somme = termines * 100
    programmeAnnuel.forEach(k => {
      const e = getEtatK(k.id)
      if (e?.statut === 'en_cours') somme += e.pourcentage || 0
    })
    const tauxGlobal = programmeAnnuel.length > 0 ? Math.round(somme / programmeAnnuel.length) : 0

    return { termines, enCours, pasCommences, tauxGlobal, total: programmeAnnuel.length }
  }
  
  // === RENDU ADMIN ===
  if (etape === 'admin') {
    return (
      <AdminPanel
        onRetour={() => setEtape('accueil')}
        onKourelsChange={(updated) => setKourels(updated)}
      />
    )
  }

  // === RENDU ACCUEIL ===
  if (etape === 'accueil') {
    return (
      <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-5xl">

          {/* Bandeau header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-vert-fonce text-white px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-t-2xl">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-white flex items-center justify-center p-1 flex-shrink-0">
              <img src="/images/logo-dmn.png" alt="Logo DMN" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm sm:text-base leading-tight truncate">Daara Madjmahoun Noreyni</div>
              <div className="text-xs leading-tight" style={{ color: '#8CD2B4' }}>
                UCAD · Pôle Kourel Centrale · Commission Conservatoire
              </div>
            </div>
            <button
              onClick={() => setEtape('admin')}
              title="Espace Administrateur"
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg transition flex-shrink-0 whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#8CD2B4' }}
            >
              <ShieldCheck size={12} className="sm:hidden" />
              <ShieldCheck size={13} className="hidden sm:block" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Corps : logo à gauche, sélecteur à droite */}
          <div className="bg-white shadow-xl flex flex-col sm:flex-row rounded-b-2xl overflow-hidden">

            {/* Colonne gauche – branding */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6"
              style={{ width: 'auto', height: 'auto', background: '#E8F5E9', borderRight: '0 sm:1px solid #C8E6C9', borderBottom: '1px solid #C8E6C9 sm:none' }}>
              <img src="/images/logo-dmn.png" alt="Logo DMN"
                className="w-16 sm:w-20 h-16 sm:h-20 object-contain" style={{ mixBlendMode: 'multiply' }} />
              <p className="text-center text-xs sm:text-xs font-bold leading-snug" style={{ color: '#014421' }}>
                Rapport de Suivi
              </p>
              <div className="w-8 h-0.5 rounded" style={{ background: '#16824E' }} />
            </div>

            {/* Colonne droite – sélection */}
            <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: '#014421' }}>
                Sélectionnez votre kourel
              </p>

              {loadingKourels ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader size={22} className="animate-spin" style={{ color: '#16824E' }} />
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-1.5 overflow-y-auto flex-1" style={{ maxHeight: '350px', height: 'auto' }}>
                  {kourels.map(kourel => (
                    <label key={kourel.id}
                      className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg cursor-pointer transition-colors text-sm sm:text-base"
                      style={{
                        borderColor: kourelSelectionne === kourel.id ? '#16824E' : '#E5E7EB',
                        background:  kourelSelectionne === kourel.id ? '#E8F5E9'  : 'white',
                      }}>
                      <input type="radio" name="kourel" value={kourel.id}
                        checked={kourelSelectionne === kourel.id}
                        onChange={() => setKourelSelectionne(kourel.id)}
                        className="accent-vert-principal flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold truncate" style={{ color: '#014421' }}>{kourel.nom}</div>
                        <div className="text-xs text-gray-500 truncate">{kourel.responsable}</div>
                      </div>
                    </label>
                  ))}

                  {/* Autre kourel */}
                  <label className="flex items-start gap-2.5 px-3 py-2 border rounded-lg cursor-pointer transition-colors"
                    style={{
                      borderColor: kourelSelectionne === 'autre' ? '#16824E' : '#E5E7EB',
                      background:  kourelSelectionne === 'autre' ? '#E8F5E9'  : 'white',
                    }}>
                    <input type="radio" name="kourel" value="autre"
                      checked={kourelSelectionne === 'autre'}
                      onChange={() => setKourelSelectionne('autre')}
                      className="accent-vert-principal mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#014421' }}>Autre kourel</div>
                      {kourelSelectionne === 'autre' && (
                        <div className="space-y-1.5 mt-2">
                          <input type="text" placeholder="Nom du kourel" value={autreKourel.nom}
                            onChange={(e) => setAutreKourel({ ...autreKourel, nom: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-vert-principal" />
                          <input type="text" placeholder="Responsable" value={autreKourel.responsable}
                            onChange={(e) => setAutreKourel({ ...autreKourel, responsable: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-vert-principal" />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
            <button
              onClick={() => setEtape('config_programme')}
              disabled={!kourelSelectionne || kourelSelectionne === 'autre' || loadingProgramme}
              className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ background: '#34495E' }}
            >
              <Edit2 size={14} className="sm:hidden" />
              <Edit2 size={16} className="hidden sm:block" />
              <span className="sm:inline">Programme Annuel</span>
            </button>
            <button
              onClick={() => { setEtape('rapport'); setSousEtape(1) }}
              disabled={!kourelSelectionne || loadingProgramme}
              className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              style={{ background: '#16824E' }}
            >
              {loadingProgramme ? <Loader size={14} className="animate-spin sm:size-[15px]" /> : <ChevronRight size={14} className="sm:hidden" />}
              {loadingProgramme ? '' : <ChevronRight size={16} className="hidden sm:block" />}
              {loadingProgramme ? 'Chargement...' : 'Créer un Rapport'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // === RENDU CONFIGURATION PROGRAMME ANNUEL ===
  if (etape === 'config_programme') {
    return (
      <ConfigProgrammeAnnuel
        kourel={getKourelActuel()}
        kourelId={kourelSelectionne}
        programmeAnnuel={programmeAnnuel}
        setProgrammeAnnuel={setProgrammeAnnuel}
        retour={() => setEtape('accueil')}
      />
    )
  }

  // === RENDU FORMULAIRE RAPPORT ===
  if (etape === 'rapport') {
    return <FormulaireRapport 
      kourel={getKourelActuel()}
      programmeAnnuel={programmeAnnuel}
      rapport={rapport}
      setRapport={setRapport}
      sousEtape={sousEtape}
      setSousEtape={setSousEtape}
      retour={() => setEtape('accueil')}
      calculTaux={calculTaux}
      calculStatut={calculStatut}
      calculStatsProgamme={calculStatsProgamme}
    />
  }
  
  return null
}

// COMPOSANT : Configuration Programme Annuel (accessible au responsable, sauvegarde Supabase)
function ConfigProgrammeAnnuel({ kourel, kourelId, programmeAnnuel, setProgrammeAnnuel, retour }) {
  const [enEdition, setEnEdition] = useState(null)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '' })
  const [saving, setSaving] = useState(false)

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.melodie) return
    setSaving(true)
    try {
      const k = await ajouterKhassida(kourelId, nouveau.nom, nouveau.melodie, programmeAnnuel.length)
      setProgrammeAnnuel([...programmeAnnuel, k])
      setNouveau({ nom: '', melodie: '' })
    } finally {
      setSaving(false)
    }
  }

  const supprimer = async (id) => {
    await supprimerKhassida(id)
    setProgrammeAnnuel(programmeAnnuel.filter(k => k.id !== id))
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      await modifierKhassida(k.id, k.nom, k.melodie)
      setProgrammeAnnuel(programmeAnnuel.map(p => p.id === k.id ? k : p))
      setEnEdition(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-5xl">

        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-5 py-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#014421' }}>
            <Edit2 size={15} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#014421' }}>Programme Annuel</p>
            <p className="text-xs text-gray-400 truncate">{kourel?.nom} · {kourel?.responsable}</p>
          </div>
          <button onClick={retour}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-vert-fonce transition py-1.5 px-3 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={16} /> Retour
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Ajouter */}
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm self-start w-full">
            <h3 className="text-xs sm:text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: '#014421' }}>
              <Plus size={13} className="sm:hidden" />
              <Plus size={15} className="hidden sm:block" /> Nouveau khassida
            </h3>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <input type="text" placeholder="Nom du khassida" value={nouveau.nom}
                onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
              <input type="text" placeholder="Mélodie (ex: Serigne Abdou Diop)" value={nouveau.melodie}
                onChange={(e) => setNouveau({ ...nouveau, melodie: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
            </div>
            <button onClick={ajouter} disabled={!nouveau.nom || !nouveau.melodie || saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition"
              style={{ background: '#16824E' }}>
              <Plus size={15} /> {saving ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#014421' }}>
              Khassidas ({programmeAnnuel.length})
            </h3>
            {programmeAnnuel.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">Aucun khassida. Ajoutez-en un ci-contre.</div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
                {programmeAnnuel.map((k, index) => (
                  <div key={k.id} className="border border-gray-100 rounded-lg p-3 hover:border-vert-principal transition">
                    {enEdition?.id === k.id ? (
                      <div className="space-y-2">
                        <input type="text" value={enEdition.nom}
                          onChange={(e) => setEnEdition({ ...enEdition, nom: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <input type="text" value={enEdition.melodie}
                          onChange={(e) => setEnEdition({ ...enEdition, melodie: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                        <div className="flex gap-2">
                          <button onClick={() => sauvegarderEdition(enEdition)}
                            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                            style={{ background: '#16824E' }}>
                            {saving ? 'Enregistrement...' : 'Sauvegarder'}
                          </button>
                          <button onClick={() => setEnEdition(null)}
                            className="text-xs font-semibold text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: '#014421' }}>{index + 1}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: '#014421' }}>{k.nom}</div>
                            <div className="text-xs text-gray-400 truncate">{k.melodie}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEnEdition({ ...k })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 transition" style={{ color: '#34495E' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => supprimer(k.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#C0392B' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
