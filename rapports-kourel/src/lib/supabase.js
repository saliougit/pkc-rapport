import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('[Supabase] Variables manquantes')
}

const fetchWithTimeout = (input, init) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  return fetch(input, { ...init, signal: init?.signal ? (() => { const s = new AbortController(); init.signal.addEventListener('abort', () => s.abort()); controller.signal.addEventListener('abort', () => s.abort()); return s.signal })() : controller.signal })
    .finally(() => clearTimeout(timeoutId))
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true },
  global: { fetch: fetchWithTimeout },
})

// Helper : appelle une route Express /api/data/* et retourne le JSON
async function api(endpoint, options = {}) {
  const res = await fetch(`/api/data${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Erreur serveur')
  return json
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function verifyPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw { message: 'Ancien mot de passe incorrect.' }
  return data
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
}

export async function resetPasswordForEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
  return data
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Profils ───────────────────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  const json = await api(`/profiles/${userId}`)
  return json.data
}

export async function updateProfile(userId, updates) {
  await api(`/profiles/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

// ── Kourels ──────────────────────────────────────────────────────────────────

export async function fetchKourels() {
  const json = await api('/kourels')
  return json.data
}

export async function ajouterKourel(nom, responsable, effectif_total = 0, effectif_actif = 0) {
  const json = await api('/kourels', {
    method: 'POST',
    body: JSON.stringify({ nom, responsable, effectif_total, effectif_actif }),
  })
  return json.data
}

export async function modifierKourel(id, nom, responsable, telephone, callmebot_apikey, effectif_total = 0, effectif_actif = 0) {
  await api(`/kourels/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nom, responsable, telephone, callmebot_apikey, effectif_total, effectif_actif }),
  })
}

export async function supprimerKourel(id) {
  await api(`/kourels/${id}`, { method: 'DELETE' })
}

// ── Programme Annuel ─────────────────────────────────────────────────────────

export async function fetchProgramme(kourelId) {
  const json = await api(`/programme/${kourelId}`)
  return json.data
}

export async function ajouterKhassida(kourelId, nom, melodie, ordre) {
  const json = await api('/programme', {
    method: 'POST',
    body: JSON.stringify({ kourel_id: kourelId, nom, melodie, ordre }),
  })
  return json.data
}

export async function modifierKhassida(id, nom, melodie) {
  await api(`/programme/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nom, melodie }),
  })
}

export async function supprimerKhassida(id) {
  await api(`/programme/${id}`, { method: 'DELETE' })
}

// ── Membres du comité ────────────────────────────────────────────────────────

export async function fetchMembres() {
  const json = await api('/membres')
  return json.data
}

export async function ajouterMembre(prenom, nom, kourel, telephone, statut) {
  const json = await api('/membres', {
    method: 'POST',
    body: JSON.stringify({ prenom, nom, kourel, telephone, statut: statut || 'actif' }),
  })
  return json.data
}

export async function modifierMembre(id, updates) {
  await api(`/membres/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function supprimerMembre(id) {
  await api(`/membres/${id}`, { method: 'DELETE' })
}

// ── Types d'événements ──────────────────────────────────────────────────────

export async function fetchTypesEvenements() {
  const json = await api('/types-evenements')
  return json.data
}

export async function ajouterTypeEvenement(nom, description) {
  const json = await api('/types-evenements', {
    method: 'POST',
    body: JSON.stringify({ nom, description }),
  })
  return json.data
}

export async function modifierTypeEvenement(id, nom, description) {
  await api(`/types-evenements/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nom, description }),
  })
}

export async function supprimerTypeEvenement(id) {
  await api(`/types-evenements/${id}`, { method: 'DELETE' })
}

// ── Lieux ────────────────────────────────────────────────────────────────────

export async function fetchLieux() {
  const json = await api('/lieux')
  return json.data
}

export async function ajouterLieu(nom) {
  const json = await api('/lieux', {
    method: 'POST',
    body: JSON.stringify({ nom }),
  })
  return json.data
}

// ── Événements ───────────────────────────────────────────────────────────────

export async function fetchEvenements() {
  const json = await api('/evenements')
  return json.data
}

export async function ajouterEvenement(evenement) {
  const json = await api('/evenements', {
    method: 'POST',
    body: JSON.stringify({
      type_id: evenement.type_id,
      date_evenement: evenement.date_evenement,
      lieu_id: evenement.lieu_id || null,
      statut: evenement.statut || 'à venir',
    }),
  })
  return json.data
}

export async function ajouterEvenementKourel(evenementId, kourelId) {
  const json = await api('/evenement-kourels', {
    method: 'POST',
    body: JSON.stringify({ evenement_id: evenementId, kourel_id: kourelId }),
  })
  return json.data
}

export async function supprimerEvenementKourels(evenementId) {
  await api(`/evenements/${evenementId}/kourels`, { method: 'DELETE' })
}

export async function modifierEvenement(id, updates) {
  await api(`/evenements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function modifierNoteDefinitive(evenementKourelId, note) {
  await api(`/evenement-kourels/${evenementKourelId}`, {
    method: 'PUT',
    body: JSON.stringify({ note_definitive: note }),
  })
}

export async function modifierEvenementKourel(evenementKourelId, updates) {
  await api(`/evenement-kourels/${evenementKourelId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function supprimerEvenement(id) {
  await api(`/evenements/${id}`, { method: 'DELETE' })
}

// ── Évaluateurs / Paginateurs par événement ─────────────────────────────────

export async function fetchEvalMembres(evenementId) {
  const json = await api(`/eval-membres/${evenementId}`)
  return json.data
}

export async function assignerEvalMembre(evenementKourelId, membreId, role, codeAcces) {
  const json = await api('/eval-membres', {
    method: 'POST',
    body: JSON.stringify({ evenement_kourel_id: evenementKourelId, membre_id: membreId, role, code_acces: codeAcces }),
  })
  return json.data
}

export async function supprimerEvalMembre(id) {
  await api(`/eval-membres/${id}`, { method: 'DELETE' })
}

// ── Critères d'évaluation ────────────────────────────────────────────────────

export async function fetchCriteres() {
  const json = await api('/criteres')
  return json.data
}

export async function ajouterCritere(section_nom, description) {
  const json = await api('/criteres', {
    method: 'POST',
    body: JSON.stringify({ section_nom, description }),
  })
  return json.data
}

export async function modifierCritere(id, updates) {
  await api(`/criteres/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function supprimerCritere(id) {
  await api(`/criteres/${id}`, { method: 'DELETE' })
}

// ── Évaluations ──────────────────────────────────────────────────────────────

export async function fetchEvaluations(evenementId) {
  const json = await api(`/evaluations/${evenementId}`)
  return json.data
}

export async function getOrCreateEvaluation(evenementId, membreId) {
  const json = await api(`/evaluations/get-or-create/${evenementId}/${membreId}`)
  return json.data
}

export async function saveEvaluationNote(evaluationId, critereId, appreciation, note, remarques, nombre_present) {
  const json = await api('/evaluation-notes', {
    method: 'POST',
    body: JSON.stringify({ evaluation_id: evaluationId, critere_id: critereId, appreciation, note, remarques, nombre_present }),
  })
  return json.data
}

export async function soumettreEvaluation(evaluationId, commentaire) {
  await api('/evaluations/soumettre', {
    method: 'POST',
    body: JSON.stringify({ evaluation_id: evaluationId, commentaire }),
  })
}

// ── Validation de code d'accès ──────────────────────────────────────────────

export async function validerCodeAcces(code) {
  const res = await fetch('/api/valider-code-acces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Code invalide')
  return json.data
}