import { useState, useEffect } from 'react'
import {
  ChevronLeft, Plus, Trash2, Edit2, Save, X,
  LogOut, Users, BookOpen, ShieldCheck, Loader
} from 'lucide-react'
import {
  loginAdmin, logoutAdmin, getSession,
  fetchKourels, ajouterKourel, modifierKourel, supprimerKourel,
  fetchProgramme, ajouterKhassida, modifierKhassida, supprimerKhassida
} from '../lib/supabase'

// ─── Login Modal ─────────────────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginAdmin(email, password)
      onLogin()
    } catch (err) {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#014421' }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#014421' }}>Espace Administrateur</p>
            <p className="text-xs text-gray-400">Accès réservé</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none"
              placeholder="admin@dmn.sn" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none"
              placeholder="••••••••" />
          </div>
          {error && (
            <p className="text-xs text-rouge-alerte font-semibold">{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition"
            style={{ background: '#014421' }}>
            {loading ? <Loader size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Gestion Programme d'un Kourel ───────────────────────────────────────────
function GestionProgramme({ kourel, onRetour }) {
  const [programme, setProgramme] = useState([])
  const [loading, setLoading] = useState(true)
  const [nouveau, setNouveau] = useState({ nom: '', melodie: '' })
  const [enEdition, setEnEdition] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProgramme(kourel.id)
      .then(setProgramme)
      .finally(() => setLoading(false))
  }, [kourel.id])

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.melodie) return
    setSaving(true)
    try {
      const k = await ajouterKhassida(kourel.id, nouveau.nom, nouveau.melodie, programme.length)
      setProgramme([...programme, k])
      setNouveau({ nom: '', melodie: '' })
    } finally {
      setSaving(false)
    }
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      await modifierKhassida(k.id, k.nom, k.melodie)
      setProgramme(programme.map(p => p.id === k.id ? k : p))
      setEnEdition(null)
    } finally {
      setSaving(false)
    }
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce khassida du programme ?')) return
    await supprimerKhassida(id)
    setProgramme(programme.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onRetour}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-vert-fonce px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
          <ChevronLeft size={16} /> Retour
        </button>
        <div>
          <p className="text-sm font-bold" style={{ color: '#014421' }}>{kourel.nom}</p>
          <p className="text-xs text-gray-400">Programme annuel · {programme.length} khassida(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ajouter */}
        <div className="bg-white rounded-xl p-5 shadow-sm self-start">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#014421' }}>
            <Plus size={15} /> Nouveau khassida
          </h3>
          <div className="space-y-3 mb-4">
            <input type="text" placeholder="Nom du khassida" value={nouveau.nom}
              onChange={e => setNouveau({ ...nouveau, nom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
            <input type="text" placeholder="Mélodie (ex: Serigne Abdou Diop)" value={nouveau.melodie}
              onChange={e => setNouveau({ ...nouveau, melodie: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
          </div>
          <button onClick={ajouter} disabled={!nouveau.nom || !nouveau.melodie || saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition"
            style={{ background: '#16824E' }}>
            {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            Ajouter
          </button>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold mb-4" style={{ color: '#014421' }}>
            Khassidas ({programme.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader size={20} className="animate-spin text-gray-300" /></div>
          ) : programme.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun khassida.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 340 }}>
              {programme.map((k, idx) => (
                <div key={k.id} className="border border-gray-100 rounded-lg p-3 hover:border-vert-principal transition">
                  {enEdition?.id === k.id ? (
                    <div className="space-y-2">
                      <input type="text" value={enEdition.nom}
                        onChange={e => setEnEdition({ ...enEdition, nom: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                      <input type="text" value={enEdition.melodie}
                        onChange={e => setEnEdition({ ...enEdition, melodie: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                      <div className="flex gap-2">
                        <button onClick={() => sauvegarderEdition(enEdition)}
                          className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                          style={{ background: '#16824E' }}>
                          <Save size={12} /> Sauvegarder
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
                        <span className="text-xs font-bold flex-shrink-0 w-5 text-center" style={{ color: '#014421' }}>{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: '#014421' }}>{k.nom}</div>
                          <div className="text-xs text-gray-400 truncate">{k.melodie}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEnEdition({ ...k })}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition" style={{ color: '#34495E' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => supprimer(k.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#C0392B' }}>
                          <Trash2 size={13} />
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
  )
}

// ─── Panel Principal Admin ────────────────────────────────────────────────────
export function AdminPanel({ onRetour, onKourelsChange }) {
  const [session, setSession] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [kourels, setKourels] = useState([])
  const [loading, setLoading] = useState(true)
  const [vue, setVue] = useState('kourels') // 'kourels' | 'programme'
  const [kourelActif, setKourelActif] = useState(null)
  const [nouveau, setNouveau] = useState({ nom: '', responsable: '' })
  const [enEdition, setEnEdition] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) chargerKourels()
      else setLoading(false)
    })
  }, [])

  const chargerKourels = async () => {
    setLoading(true)
    try {
      const data = await fetchKourels()
      setKourels(data)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    const s = await getSession()
    setSession(s)
    setShowLogin(false)
    chargerKourels()
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setSession(null)
    setKourels([])
  }

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.responsable) return
    setSaving(true)
    try {
      const k = await ajouterKourel(nouveau.nom, nouveau.responsable)
      const updated = [...kourels, k]
      setKourels(updated)
      onKourelsChange(updated)
      setNouveau({ nom: '', responsable: '' })
    } finally {
      setSaving(false)
    }
  }

  const sauvegarderEdition = async (k) => {
    setSaving(true)
    try {
      await modifierKourel(k.id, k.nom, k.responsable)
      const updated = kourels.map(c => c.id === k.id ? k : c)
      setKourels(updated)
      onKourelsChange(updated)
      setEnEdition(null)
    } finally {
      setSaving(false)
    }
  }

  const supprimer = async (id) => {
    if (!confirm('Désactiver ce kourel ? Il ne sera plus visible pour les utilisateurs.')) return
    await supprimerKourel(id)
    const updated = kourels.filter(k => k.id !== id)
    setKourels(updated)
    onKourelsChange(updated)
  }

  const ouvrirProgramme = (k) => {
    setKourelActif(k)
    setVue('programme')
  }

  return (
    <div className="min-h-screen bg-gris-clair flex flex-col items-center justify-center px-4 py-4">
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-5 py-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#014421' }}>
            <ShieldCheck size={15} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: '#014421' }}>Espace Administrateur</p>
            <p className="text-xs text-gray-400">
              {session ? `Connecté · ${session.user?.email}` : 'Non connecté'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-rouge-alerte px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                <LogOut size={13} /> Déconnexion
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                style={{ background: '#014421' }}>
                <ShieldCheck size={13} /> Se connecter
              </button>
            )}
            <button onClick={onRetour}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-vert-fonce px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft size={16} /> Retour
            </button>
          </div>
        </div>

        {/* Contenu */}
        {!session ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShieldCheck size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400 mb-4">Connectez-vous pour accéder à la gestion.</p>
            <button onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 mx-auto text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition"
              style={{ background: '#014421' }}>
              <ShieldCheck size={15} /> Se connecter
            </button>
          </div>
        ) : vue === 'programme' && kourelActif ? (
          <GestionProgramme kourel={kourelActif} onRetour={() => { setVue('kourels'); setKourelActif(null) }} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Ajouter Kourel */}
            <div className="bg-white rounded-xl p-5 shadow-sm self-start">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#014421' }}>
                <Plus size={15} /> Nouveau kourel
              </h3>
              <div className="space-y-3 mb-4">
                <input type="text" placeholder="Nom du kourel" value={nouveau.nom}
                  onChange={e => setNouveau({ ...nouveau, nom: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
                <input type="text" placeholder="Nom du responsable" value={nouveau.responsable}
                  onChange={e => setNouveau({ ...nouveau, responsable: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-vert-principal focus:outline-none" />
              </div>
              <button onClick={ajouter} disabled={!nouveau.nom || !nouveau.responsable || saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition"
                style={{ background: '#16824E' }}>
                {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                Ajouter
              </button>
            </div>

            {/* Liste Kourels */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#014421' }}>
                <Users size={15} /> Kourels ({kourels.length})
              </h3>
              {loading ? (
                <div className="flex justify-center py-8"><Loader size={20} className="animate-spin text-gray-300" /></div>
              ) : kourels.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucun kourel.</p>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 380 }}>
                  {kourels.map(k => (
                    <div key={k.id} className="border border-gray-100 rounded-lg p-3 hover:border-vert-principal transition">
                      {enEdition?.id === k.id ? (
                        <div className="space-y-2">
                          <input type="text" value={enEdition.nom}
                            onChange={e => setEnEdition({ ...enEdition, nom: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                          <input type="text" value={enEdition.responsable}
                            onChange={e => setEnEdition({ ...enEdition, responsable: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-vert-principal" />
                          <div className="flex gap-2">
                            <button onClick={() => sauvegarderEdition(enEdition)}
                              className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                              style={{ background: '#16824E' }}>
                              <Save size={12} /> Sauvegarder
                            </button>
                            <button onClick={() => setEnEdition(null)}
                              className="text-xs font-semibold text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: '#014421' }}>{k.nom}</div>
                            <div className="text-xs text-gray-400 truncate">{k.responsable}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => ouvrirProgramme(k)} title="Gérer le programme"
                              className="p-1.5 rounded-lg hover:bg-vert-pastel transition" style={{ color: '#16824E' }}>
                              <BookOpen size={13} />
                            </button>
                            <button onClick={() => setEnEdition({ ...k })}
                              className="p-1.5 rounded-lg hover:bg-blue-50 transition" style={{ color: '#34495E' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => supprimer(k.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#C0392B' }}>
                              <Trash2 size={13} />
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
        )}
      </div>
    </div>
  )
}
