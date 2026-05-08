import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, Edit2, Download, Save } from 'lucide-react'
import { FormulaireRapport } from './components/FormulaireRapport'
import { useLocalStorage } from './hooks/useLocalStorage'

// Liste des kourels par défaut
const KOURELS_DEFAULT = [
  { id: 1, nom: 'Kourel 1', responsable: 'Elhadji NDIAYE' },
  { id: 2, nom: 'Kourel 2', responsable: 'Abdoul Hakim BABOU' },
  { id: 3, nom: 'Kourel 3', responsable: 'Malang DIATTA' },
  { id: 4, nom: 'Kourel 4', responsable: 'M. Falilou SEYE' },
  { id: 5, nom: 'Kourel Touba Parcelles', responsable: 'Bassirou DIOUM' },
  { id: 6, nom: 'Kourel Sokhna Astou Gawane', responsable: 'Bassirou DIOUM' }
]

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

function App() {
  // État global
  const [etape, setEtape] = useState('accueil') // accueil, config_programme, rapport
  const [sousEtape, setSousEtape] = useState(1) // Pour le formulaire rapport (1-4)
  
  // Kourel sélectionné - avec localStorage
  const [kourelSelectionne, setKourelSelectionne] = useLocalStorage('kourel_selectionne', null)
  const [autreKourel, setAutreKourel] = useLocalStorage('kourel_autre', { nom: '', responsable: '' })
  
  // Programme annuel - avec localStorage (résout les problèmes de persistence)
  const [programmeAnnuel, setProgrammeAnnuel] = useLocalStorage('programme_annuel', [])
  
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
  
  // Les données sont automatiquement sauvegardées via le hook useLocalStorage!
  
  // Fonctions helpers
  const getKourelActuel = () => {
    if (kourelSelectionne === 'autre') {
      return autreKourel
    }
    return KOURELS_DEFAULT.find(k => k.id === kourelSelectionne)
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
    const etat = rapport.programme_annuel_etat
    const termines = etat.filter(e => e.statut === 'termine').length
    const enCours = etat.filter(e => e.statut === 'en_cours').length
    const pasCommences = etat.filter(e => e.statut === 'pas_commence').length
    
    // Calcul taux global
    let somme = termines * 100
    etat.filter(e => e.statut === 'en_cours').forEach(e => {
      somme += e.pourcentage || 0
    })
    const tauxGlobal = programmeAnnuel.length > 0 ? Math.round(somme / programmeAnnuel.length) : 0
    
    return { termines, enCours, pasCommences, tauxGlobal, total: programmeAnnuel.length }
  }
  
  // === RENDU ACCUEIL ===
  if (etape === 'accueil') {
    return (
      <div className="min-h-screen bg-gris-clair py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Logo et titre */}
          <div className="bg-white border-4 border-vert-principal rounded-lg p-8 mb-6 text-center">
            <div className="w-48 h-48 mx-auto mb-4 rounded-lg flex items-center justify-center">
              <img 
                src="/images/logo-dmn.png" 
                alt="Logo DMN UCAD" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-vert-fonce mb-2">
              Daara Madjmahoun Noreyni
            </h1>
            <p className="text-lg text-vert-principal mb-1">
              Université Cheikh Anta Diop de Dakar
            </p>
            <p className="text-gray-600">
              Pôle Kourel Centrale -- Commission Conservatoire
            </p>
          </div>
          
          <div className="w-full h-1 bg-gradient-to-r from-vert-principal via-vert-clair to-orange-strat mb-6"></div>
          
          <h2 className="text-2xl font-bold text-vert-fonce mb-6 text-center">
            Rapport de Suivi des Kourels
          </h2>
          
          {/* Sélection kourel */}
          <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
            <label className="block text-sm font-bold text-vert-fonce mb-3">
              Sélectionnez votre kourel :
            </label>
            <div className="space-y-2">
              {KOURELS_DEFAULT.map(kourel => (
                <label
                  key={kourel.id}
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-vert-pastel transition"
                  style={{
                    borderColor: kourelSelectionne === kourel.id ? '#16824E' : '#E0E0E0',
                    backgroundColor: kourelSelectionne === kourel.id ? '#E8F5E9' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="kourel"
                    value={kourel.id}
                    checked={kourelSelectionne === kourel.id}
                    onChange={() => setKourelSelectionne(kourel.id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold text-vert-fonce">{kourel.nom}</div>
                    <div className="text-sm text-gray-600">{kourel.responsable}</div>
                  </div>
                </label>
              ))}
              
              {/* Autre kourel */}
              <label
                className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-vert-pastel transition"
                style={{
                  borderColor: kourelSelectionne === 'autre' ? '#16824E' : '#E0E0E0',
                  backgroundColor: kourelSelectionne === 'autre' ? '#E8F5E9' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="kourel"
                  value="autre"
                  checked={kourelSelectionne === 'autre'}
                  onChange={() => setKourelSelectionne('autre')}
                  className="mr-3 mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-vert-fonce mb-2">Autre kourel</div>
                  {kourelSelectionne === 'autre' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nom du kourel"
                        value={autreKourel.nom}
                        onChange={(e) => setAutreKourel({...autreKourel, nom: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Responsable"
                        value={autreKourel.responsable}
                        onChange={(e) => setAutreKourel({...autreKourel, responsable: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              onClick={() => setEtape('config_programme')}
              disabled={!kourelSelectionne}
              className="flex-1 bg-bleu-info text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Edit2 size={20} />
              Gérer Programme Annuel
            </button>
            
            <button
              onClick={() => {
                setEtape('rapport')
                setSousEtape(1)
              }}
              disabled={!kourelSelectionne}
              className="flex-1 bg-vert-principal text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Créer un Rapport
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // === RENDU CONFIGURATION PROGRAMME ANNUEL ===
  if (etape === 'config_programme') {
    return <ConfigProgrammeAnnuel 
      kourel={getKourelActuel()}
      programmeAnnuel={programmeAnnuel}
      setProgrammeAnnuel={setProgrammeAnnuel}
      retour={() => setEtape('accueil')}
    />
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

// COMPOSANT : Configuration Programme Annuel
function ConfigProgrammeAnnuel({ kourel, programmeAnnuel, setProgrammeAnnuel, retour }) {
  const [enEdition, setEnEdition] = useState(null)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '' })
  
  const ajouterKhassida = () => {
    if (nouveau.nom && nouveau.melodie) {
      setProgrammeAnnuel([...programmeAnnuel, {
        id: Date.now(),
        nom: nouveau.nom,
        melodie: nouveau.melodie
      }])
      setNouveau({ nom: '', melodie: '' })
    }
  }
  
  const supprimerKhassida = (id) => {
    setProgrammeAnnuel(programmeAnnuel.filter(k => k.id !== id))
  }
  
  const modifierKhassida = (id, data) => {
    setProgrammeAnnuel(programmeAnnuel.map(k => k.id === id ? {...k, ...data} : k))
    setEnEdition(null)
  }
  
  return (
    <div className="min-h-screen bg-gris-clair py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Entête */}
        <div className="bg-vert-principal text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Programme Annuel</h1>
          <p className="text-vert-pastel">{kourel.nom} — {kourel.responsable}</p>
        </div>
        
        {/* Ajouter un khassida */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-vert-fonce mb-4 flex items-center gap-2">
            <Plus size={20} />
            Ajouter un khassida
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nom du khassida"
              value={nouveau.nom}
              onChange={(e) => setNouveau({...nouveau, nom: e.target.value})}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
            />
            <input
              type="text"
              placeholder="Mélodie (ex: Serigne Abdou Diop)"
              value={nouveau.melodie}
              onChange={(e) => setNouveau({...nouveau, melodie: e.target.value})}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
            />
          </div>
          <button
            onClick={ajouterKhassida}
            disabled={!nouveau.nom || !nouveau.melodie}
            className="bg-vert-principal text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
        
        {/* Liste des khassidas */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-vert-fonce mb-4">
            Liste des khassidas ({programmeAnnuel.length})
          </h3>
          {programmeAnnuel.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun khassida configuré. Ajoutez-en un ci-dessus.
            </p>
          ) : (
            <div className="space-y-3">
              {programmeAnnuel.map((khassida, index) => (
                <div key={khassida.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-vert-principal transition">
                  {enEdition === khassida.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={khassida.nom}
                        onChange={(e) => modifierKhassida(khassida.id, { nom: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={khassida.melodie}
                        onChange={(e) => modifierKhassida(khassida.id, { melodie: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => setEnEdition(null)}
                        className="bg-vert-principal text-white px-4 py-1 rounded text-sm"
                      >
                        Terminer
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-vert-fonce">{index + 1}.</span>
                          <div>
                            <div className="font-semibold text-vert-fonce">{khassida.nom}</div>
                            <div className="text-sm text-gray-600">{khassida.melodie}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEnEdition(khassida.id)}
                          className="p-2 text-bleu-info hover:bg-bleu-pastel rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => supprimerKhassida(khassida.id)}
                          className="p-2 text-rouge-alerte hover:bg-rouge-pastel rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Bouton retour */}
        <button
          onClick={retour}
          className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Retour
        </button>
      </div>
    </div>
  )
}

// Suite dans le prochain fichier...
export default App
