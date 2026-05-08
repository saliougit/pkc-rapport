import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, Download, Save } from 'lucide-react'
import { genererPDF } from '../utils/pdfService'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export function FormulaireRapport({ 
  kourel, 
  programmeAnnuel, 
  rapport, 
  setRapport, 
  sousEtape, 
  setSousEtape, 
  retour,
  calculTaux,
  calculStatut,
  calculStatsProgamme
}) {
  
  // === ÉTAPE 1 : IDENTIFICATION ===
  if (sousEtape === 1) {
    return (
      <div className="min-h-screen bg-gris-clair py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-vert-fonce">Étape 1/4 : Identification</span>
              <span className="text-sm text-gray-600">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-vert-principal h-2 rounded-full" style={{width: '25%'}}></div>
            </div>
          </div>
          
          {/* Formulaire */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-vert-fonce mb-6">Informations du rapport</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kourel
                </label>
                <input
                  type="text"
                  value={kourel.nom}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={kourel.responsable}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Représentant (optionnel)
                </label>
                <input
                  type="text"
                  value={rapport.representant}
                  onChange={(e) => setRapport({...rapport, representant: e.target.value})}
                  placeholder="Laisser vide si identique au responsable"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mois du rapport
                  </label>
                  <select
                    value={rapport.mois}
                    onChange={(e) => setRapport({...rapport, mois: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {MOIS.map(mois => (
                      <option key={mois} value={mois}>{mois}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={rapport.annee}
                    onChange={(e) => setRapport({...rapport, annee: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date du rapport
                </label>
                <input
                  type="date"
                  value={rapport.date_rapport}
                  onChange={(e) => setRapport({...rapport, date_rapport: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={retour}
              className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Retour
            </button>
            
            <button
              onClick={() => setSousEtape(2)}
              disabled={!rapport.mois}
              className="bg-vert-principal text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // === ÉTAPE 2 : MÉLODIES ===
  if (sousEtape === 2) {
    return <EtapeMelodies 
      rapport={rapport}
      setRapport={setRapport}
      programmeAnnuel={programmeAnnuel}
      setSousEtape={setSousEtape}
      calculTaux={calculTaux}
      calculStatut={calculStatut}
    />
  }
  
  // === ÉTAPE 3 : PROGRAMME ANNUEL ===
  if (sousEtape === 3) {
    return <EtapeProgrammeAnnuel 
      rapport={rapport}
      setRapport={setRapport}
      programmeAnnuel={programmeAnnuel}
      setSousEtape={setSousEtape}
      calculStatsProgamme={calculStatsProgamme}
    />
  }
  
  // === ÉTAPE 4 : APPRÉCIATION ===
  if (sousEtape === 4) {
    return <EtapeAppreciation 
      rapport={rapport}
      setRapport={setRapport}
      setSousEtape={setSousEtape}
      kourel={kourel}
      programmeAnnuel={programmeAnnuel}
    />
  }
  
  return null
}

// COMPOSANT : Étape Mélodies
function EtapeMelodies({ rapport, setRapport, programmeAnnuel, setSousEtape, calculTaux, calculStatut }) {
  const [nouvelleMelodie, setNouvelleMelodie] = useState({
    source: 'programme', // 'programme' ou 'autre'
    khassida_id: null,
    nom: '',
    melodie: '',
    type: 'nouvelle', // 'nouvelle' ou 'revision'
    mode: 'pages', // 'pages' ou 'dadj'
    pages_faites: 0,
    pages_total: 1,
    dadj_completes: [0], // Premier Dadj coché par défaut
    dadj_total: 1
  })
  
  const [enAjout, setEnAjout] = useState(false)
  
  const ajouterMelodie = () => {
    if (nouvelleMelodie.nom && nouvelleMelodie.melodie) {
      const melodie = {...nouvelleMelodie}
      
      // Calcul taux
      if (melodie.mode === 'pages') {
        melodie.taux = Math.round((melodie.pages_faites / melodie.pages_total) * 100)
      } else {
        melodie.taux = Math.round((melodie.dadj_completes.length / melodie.dadj_total) * 100)
      }
      
      melodie.statut = calculStatut(melodie.taux)
      
      setRapport({
        ...rapport,
        melodies: [...rapport.melodies, {...melodie, id: Date.now()}]
      })
      
      // Reset
      setNouvelleMelodie({
        source: 'programme',
        khassida_id: null,
        nom: '',
        melodie: '',
        type: 'nouvelle',
        mode: 'pages',
        pages_faites: 0,
        pages_total: 1,
        dadj_completes: [0],
        dadj_total: 1
      })
      setEnAjout(false)
    }
  }
  
  const supprimerMelodie = (id) => {
    setRapport({
      ...rapport,
      melodies: rapport.melodies.filter(m => m.id !== id)
    })
  }
  
  const selectionnerKhassida = (khassidaId) => {
    const khassida = programmeAnnuel.find(k => k.id === parseInt(khassidaId))
    if (khassida) {
      setNouvelleMelodie({
        ...nouvelleMelodie,
        khassida_id: khassida.id,
        nom: khassida.nom,
        melodie: khassida.melodie
      })
    }
  }
  
  const ajouterDadj = () => {
    setNouvelleMelodie({
      ...nouvelleMelodie,
      dadj_total: nouvelleMelodie.dadj_total + 1
    })
  }
  
  const toggleDadj = (index) => {
    const dadj = nouvelleMelodie.dadj_completes
    if (dadj.includes(index)) {
      setNouvelleMelodie({
        ...nouvelleMelodie,
        dadj_completes: dadj.filter(d => d !== index)
      })
    } else {
      setNouvelleMelodie({
        ...nouvelleMelodie,
        dadj_completes: [...dadj, index].sort((a, b) => a - b)
      })
    }
  }
  
  return (
    <div className="min-h-screen bg-gris-clair py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-vert-fonce">Étape 2/4 : Avancement des Mélodies</span>
            <span className="text-sm text-gray-600">50%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-vert-principal h-2 rounded-full" style={{width: '50%'}}></div>
          </div>
        </div>
        
        {/* Bouton ajouter */}
        {!enAjout && (
          <button
            onClick={() => setEnAjout(true)}
            className="w-full bg-vert-principal text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={20} />
            Ajouter une mélodie
          </button>
        )}
        
        {/* Formulaire ajout */}
        {enAjout && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-lg border-2 border-vert-principal">
            <h3 className="font-bold text-vert-fonce mb-4">Nouvelle mélodie</h3>
            
            {/* Source */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="programme"
                    checked={nouvelleMelodie.source === 'programme'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, source: e.target.value, nom: '', melodie: '', khassida_id: null})}
                    className="mr-2"
                  />
                  <span>Khassida du programme annuel</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="autre"
                    checked={nouvelleMelodie.source === 'autre'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, source: e.target.value, nom: '', melodie: '', khassida_id: null})}
                    className="mr-2"
                  />
                  <span>Autre khassida</span>
                </label>
              </div>
            </div>
            
            {/* Si programme annuel */}
            {nouvelleMelodie.source === 'programme' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sélectionner un khassida
                </label>
                <select
                  value={nouvelleMelodie.khassida_id || ''}
                  onChange={(e) => selectionnerKhassida(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                >
                  <option value="">-- Choisir --</option>
                  {programmeAnnuel.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.nom} ({k.melodie})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Si autre */}
            {nouvelleMelodie.source === 'autre' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du khassida
                  </label>
                  <input
                    type="text"
                    value={nouvelleMelodie.nom}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, nom: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mélodie
                  </label>
                  <input
                    type="text"
                    value={nouvelleMelodie.melodie}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, melodie: e.target.value})}
                    placeholder="Ex: Serigne Abdou Diop"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  />
                </div>
              </div>
            )}
            
            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="nouvelle"
                    checked={nouvelleMelodie.type === 'nouvelle'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, type: e.target.value})}
                    className="mr-2"
                  />
                  <span>Nouvelle</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="revision"
                    checked={nouvelleMelodie.type === 'revision'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, type: e.target.value})}
                    className="mr-2"
                  />
                  <span>Révision</span>
                </label>
              </div>
            </div>
            
            {/* Mode évaluation */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mode d'évaluation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="pages"
                    checked={nouvelleMelodie.mode === 'pages'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, mode: e.target.value})}
                    className="mr-2"
                  />
                  <span>Par pages</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="dadj"
                    checked={nouvelleMelodie.mode === 'dadj'}
                    onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, mode: e.target.value})}
                    className="mr-2"
                  />
                  <span>Par Dadj</span>
                </label>
              </div>
            </div>
            
            {/* Par pages */}
            {nouvelleMelodie.mode === 'pages' && (
              <div className="bg-vert-pastel p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-vert-fonce mb-2">
                      Pages faites
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={nouvelleMelodie.pages_faites}
                      onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, pages_faites: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border-2 border-vert-principal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-vert-fonce mb-2">
                      Total pages
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nouvelleMelodie.pages_total}
                      onChange={(e) => setNouvelleMelodie({...nouvelleMelodie, pages_total: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2 border-2 border-vert-principal rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-vert-principal">
                    {Math.round((nouvelleMelodie.pages_faites / nouvelleMelodie.pages_total) * 100)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Par Dadj */}
            {nouvelleMelodie.mode === 'dadj' && (
              <div className="bg-vert-pastel p-4 rounded-lg mb-4">
                <label className="block text-sm font-semibold text-vert-fonce mb-3">
                  Dadj complétés
                </label>
                <div className="space-y-2 mb-4">
                  {Array.from({length: nouvelleMelodie.dadj_total}, (_, i) => (
                    <label key={i} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nouvelleMelodie.dadj_completes.includes(i)}
                        onChange={() => toggleDadj(i)}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="font-semibold text-vert-fonce">
                        {i + 1}{i === 0 ? 'er' : 'ème'} Dadj
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={ajouterDadj}
                  className="bg-vert-principal text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter un Dadj
                </button>
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-600">
                    {nouvelleMelodie.dadj_completes.length} Dadj complétés sur {nouvelleMelodie.dadj_total}
                  </span>
                  <div className="text-2xl font-bold text-vert-principal mt-1">
                    {Math.round((nouvelleMelodie.dadj_completes.length / nouvelleMelodie.dadj_total) * 100)}%
                  </div>
                </div>
              </div>
            )}
            
            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setEnAjout(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:opacity-90"
              >
                Annuler
              </button>
              <button
                onClick={ajouterMelodie}
                disabled={!nouvelleMelodie.nom || !nouvelleMelodie.melodie}
                className="flex-1 bg-vert-principal text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
        
        {/* Liste des mélodies */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-vert-fonce mb-4">
            Mélodies ajoutées ({rapport.melodies.length})
          </h3>
          
          {rapport.melodies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune mélodie ajoutée. Cliquez sur "Ajouter une mélodie" ci-dessus.
            </p>
          ) : (
            <div className="space-y-3">
              {rapport.melodies.map((melodie) => {
                const bgColor = melodie.statut.color === 'vert' ? 'bg-vert-pastel' : 
                                melodie.statut.color === 'orange' ? 'bg-orange-pastel' : 'bg-rouge-pastel'
                const borderColor = melodie.statut.color === 'vert' ? 'border-vert-principal' : 
                                   melodie.statut.color === 'orange' ? 'border-orange-strat' : 'border-rouge-alerte'
                
                return (
                  <div key={melodie.id} className={`${bgColor} border-2 ${borderColor} rounded-lg p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-vert-fonce">{melodie.nom}</h4>
                          {melodie.type === 'revision' && (
                            <span className="text-xs bg-bleu-info text-white px-2 py-1 rounded">
                              Révision
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{melodie.melodie}</p>
                        
                        {melodie.mode === 'pages' ? (
                          <p className="text-sm text-gray-700">
                            {melodie.pages_faites} / {melodie.pages_total} pages
                          </p>
                        ) : (
                          <p className="text-sm text-gray-700">
                            {melodie.dadj_completes.length} Dadj complétés sur {melodie.dadj_total}
                          </p>
                        )}
                        
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                melodie.statut.color === 'vert' ? 'bg-vert-principal' :
                                melodie.statut.color === 'orange' ? 'bg-orange-strat' : 'bg-rouge-alerte'
                              }`}
                              style={{width: `${melodie.taux}%`}}
                            ></div>
                          </div>
                          <span className="font-bold text-sm">{melodie.taux}%</span>
                          <span className={`text-xs font-semibold ${
                            melodie.statut.color === 'vert' ? 'text-vert-principal' :
                            melodie.statut.color === 'orange' ? 'text-orange-strat' : 'text-rouge-alerte'
                          }`}>
                            {melodie.statut.label}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => supprimerMelodie(melodie.id)}
                        className="ml-4 p-2 text-rouge-alerte hover:bg-rouge-pastel rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setSousEtape(1)}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Précédent
          </button>
          
          <button
            onClick={() => setSousEtape(3)}
            className="bg-vert-principal text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            Suivant
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// COMPOSANT : Étape Programme Annuel
function EtapeProgrammeAnnuel({ rapport, setRapport, programmeAnnuel, setSousEtape, calculStatsProgamme }) {
  
  // Initialiser l'état si vide
  useEffect(() => {
    if (rapport.programme_annuel_etat.length === 0 && programmeAnnuel.length > 0) {
      setRapport({
        ...rapport,
        programme_annuel_etat: programmeAnnuel.map(k => ({
          khassida_id: k.id,
          statut: 'pas_commence',
          pourcentage: 0
        }))
      })
    }
  }, [])
  
  const updateEtat = (khassidaId, statut, pourcentage = 0) => {
    const nouvelEtat = rapport.programme_annuel_etat.map(e => 
      e.khassida_id === khassidaId ? { ...e, statut, pourcentage } : e
    )
    setRapport({ ...rapport, programme_annuel_etat: nouvelEtat })
  }
  
  const getEtat = (khassidaId) => {
    return rapport.programme_annuel_etat.find(e => e.khassida_id === khassidaId) || 
           { statut: 'pas_commence', pourcentage: 0 }
  }
  
  const stats = calculStatsProgamme()
  
  return (
    <div className="min-h-screen bg-gris-clair py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-vert-fonce">Étape 3/4 : Programme Annuel</span>
            <span className="text-sm text-gray-600">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-vert-principal h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
        </div>
        
        {programmeAnnuel.length === 0 ? (
          <div className="bg-orange-pastel border-2 border-orange-strat rounded-lg p-6 mb-6">
            <p className="text-center text-gray-700">
              Aucun khassida dans le programme annuel. Vous pouvez passer cette étape.
            </p>
          </div>
        ) : (
          <>
            {/* Stats globales */}
            <div className="bg-bleu-pastel border-2 border-bleu-info rounded-lg p-6 mb-6">
              <h3 className="font-bold text-bleu-info mb-4">Progression globale</h3>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-vert-principal">{stats.termines}</div>
                  <div className="text-sm text-gray-600">Terminés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-strat">{stats.enCours}</div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rouge-alerte">{stats.pasCommences}</div>
                  <div className="text-sm text-gray-600">Pas commencés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-bleu-info">{stats.tauxGlobal}%</div>
                  <div className="text-sm text-gray-600">Taux global</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-bleu-info h-4 rounded-full transition-all"
                  style={{width: `${stats.tauxGlobal}%`}}
                ></div>
              </div>
            </div>
            
            {/* Liste des khassidas */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-vert-fonce mb-4">
                État des khassidas ({programmeAnnuel.length})
              </h3>
              
              <div className="space-y-4">
                {programmeAnnuel.map((khassida, index) => {
                  const etat = getEtat(khassida.id)
                  
                  return (
                    <div key={khassida.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-bold text-vert-fonce">{index + 1}.</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-vert-fonce">{khassida.nom}</h4>
                          <p className="text-sm text-gray-600">{khassida.melodie}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pl-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`khassida_${khassida.id}`}
                            checked={etat.statut === 'termine'}
                            onChange={() => updateEtat(khassida.id, 'termine', 100)}
                            className="mr-3"
                          />
                          <span className="font-semibold text-vert-principal">Terminé</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`khassida_${khassida.id}`}
                            checked={etat.statut === 'en_cours'}
                            onChange={() => updateEtat(khassida.id, 'en_cours', etat.pourcentage)}
                            className="mr-3"
                          />
                          <span className="font-semibold text-orange-strat">En cours</span>
                          {etat.statut === 'en_cours' && (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={etat.pourcentage}
                              onChange={(e) => updateEtat(khassida.id, 'en_cours', parseInt(e.target.value) || 0)}
                              className="ml-3 w-20 px-2 py-1 border-2 border-orange-strat rounded"
                              placeholder="%"
                            />
                          )}
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`khassida_${khassida.id}`}
                            checked={etat.statut === 'pas_commence'}
                            onChange={() => updateEtat(khassida.id, 'pas_commence', 0)}
                            className="mr-3"
                          />
                          <span className="font-semibold text-gray-600">Pas commencé</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Textareas */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectifs atteints
                </label>
                <textarea
                  value={rapport.programme_annuel_textes.objectifs_atteints}
                  onChange={(e) => setRapport({
                    ...rapport,
                    programme_annuel_textes: {
                      ...rapport.programme_annuel_textes,
                      objectifs_atteints: e.target.value
                    }
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  placeholder="Listez les khassidas terminés et objectifs atteints..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectifs en cours
                </label>
                <textarea
                  value={rapport.programme_annuel_textes.objectifs_en_cours}
                  onChange={(e) => setRapport({
                    ...rapport,
                    programme_annuel_textes: {
                      ...rapport.programme_annuel_textes,
                      objectifs_en_cours: e.target.value
                    }
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  placeholder="Khassidas en cours avec leur avancement..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectifs non atteints
                </label>
                <textarea
                  value={rapport.programme_annuel_textes.objectifs_non_atteints}
                  onChange={(e) => setRapport({
                    ...rapport,
                    programme_annuel_textes: {
                      ...rapport.programme_annuel_textes,
                      objectifs_non_atteints: e.target.value
                    }
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  placeholder="Khassidas pas commencés ou en retard..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ajustements nécessaires
                </label>
                <textarea
                  value={rapport.programme_annuel_textes.ajustements}
                  onChange={(e) => setRapport({
                    ...rapport,
                    programme_annuel_textes: {
                      ...rapport.programme_annuel_textes,
                      ajustements: e.target.value
                    }
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
                  placeholder="Actions correctives, ajustements prévus..."
                ></textarea>
              </div>
            </div>
          </>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setSousEtape(2)}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Précédent
          </button>
          
          <button
            onClick={() => setSousEtape(4)}
            className="bg-vert-principal text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            Suivant
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// COMPOSANT : Étape Appréciation
function EtapeAppreciation({ rapport, setRapport, setSousEtape, kourel, programmeAnnuel }) {
  
  // const genererPDF = async () => {
  //   // TODO: Implémenter génération PDF LaTeX
  //   alert('Génération PDF : Fonctionnalité en cours de développement...')
  // }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const genererPDFClick = async () => {
    setLoading(true)
    setError(null)
    
    const result = await genererPDF(rapport, kourel, programmeAnnuel)
    
    if (result.success) {
      alert('✅ PDF généré avec succès !')
    } else {
      setError(result.error)
      alert(`❌ Erreur : ${result.error}`)
    }
    
    setLoading(false)
  }
    
  return (
    <div className="min-h-screen bg-gris-clair py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-vert-fonce">Étape 4/4 : Appréciation & Conclusion</span>
            <span className="text-sm text-gray-600">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-vert-principal h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
        </div>
        
        {/* Formulaire */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Appréciation générale
            </label>
            <textarea
              value={rapport.appreciation.generale}
              onChange={(e) => setRapport({
                ...rapport,
                appreciation: { ...rapport.appreciation, generale: e.target.value }
              })}
              rows="4"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-vert-principal focus:outline-none"
              placeholder="Bilan global du mois, contexte, dynamique d'équipe..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-vert-principal mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-vert-principal text-white rounded-full flex items-center justify-center text-sm">✓</span>
                Points positifs
              </label>
              <textarea
                value={rapport.appreciation.points_positifs}
                onChange={(e) => setRapport({
                  ...rapport,
                  appreciation: { ...rapport.appreciation, points_positifs: e.target.value }
                })}
                rows="4"
                className="w-full px-4 py-2 border-2 border-vert-principal rounded-lg focus:border-vert-fonce focus:outline-none"
                placeholder="Mélodies terminées, bons rattrapages..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-orange-strat mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-strat text-white rounded-full flex items-center justify-center text-sm">!</span>
                À surveiller
              </label>
              <textarea
                value={rapport.appreciation.a_surveiller}
                onChange={(e) => setRapport({
                  ...rapport,
                  appreciation: { ...rapport.appreciation, a_surveiller: e.target.value }
                })}
                rows="4"
                className="w-full px-4 py-2 border-2 border-orange-strat rounded-lg focus:border-orange-strat focus:outline-none"
                placeholder="Points nécessitant attention..."
              ></textarea>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-rouge-alerte mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-rouge-alerte text-white rounded-full flex items-center justify-center text-sm">×</span>
                En retard
              </label>
              <textarea
                value={rapport.appreciation.en_retard}
                onChange={(e) => setRapport({
                  ...rapport,
                  appreciation: { ...rapport.appreciation, en_retard: e.target.value }
                })}
                rows="4"
                className="w-full px-4 py-2 border-2 border-rouge-alerte rounded-lg focus:border-rouge-alerte focus:outline-none"
                placeholder="Mélodies en retard, actions urgentes..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-bleu-info mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-bleu-info text-white rounded-full flex items-center justify-center text-sm">→</span>
                Priorités mois suivant
              </label>
              <textarea
                value={rapport.appreciation.priorites}
                onChange={(e) => setRapport({
                  ...rapport,
                  appreciation: { ...rapport.appreciation, priorites: e.target.value }
                })}
                rows="4"
                className="w-full px-4 py-2 border-2 border-bleu-info rounded-lg focus:border-bleu-info focus:outline-none"
                placeholder="Objectifs du prochain mois..."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Résumé */}
        <div className="bg-vert-pastel border-2 border-vert-principal rounded-lg p-6 mb-6">
          <h3 className="font-bold text-vert-fonce mb-3">Résumé du rapport</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Kourel :</span> {kourel.nom}
            </div>
            <div>
              <span className="font-semibold">Période :</span> {rapport.mois} {rapport.annee}
            </div>
            <div>
              <span className="font-semibold">Mélodies :</span> {rapport.melodies.length} ajoutées
            </div>
            <div>
              <span className="font-semibold">Programme annuel :</span> {
                rapport.programme_annuel_etat.length > 0 ? 'Configuré' : 'Non configuré'
              }
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setSousEtape(3)}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Précédent
          </button>
          
          <button
            onClick={genererPDFClick}
            disabled={loading}
            className="bg-vert-principal text-white py-4 px-8 rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
          >
            <Download size={24} />
            {loading ? 'Génération en cours...' : 'Télécharger le PDF'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-rouge-pastel border-2 border-rouge-alerte rounded-lg p-4 text-rouge-alerte">
            <strong>Erreur :</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

// Suite dans le prochain fichier (Génération PDF)...
