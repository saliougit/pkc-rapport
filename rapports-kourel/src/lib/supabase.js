import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('[Supabase] Variables manquantes — VITE_SUPABASE_URL:', url, '| VITE_SUPABASE_ANON_KEY:', key)
}

export const supabase = createClient(url, key)

// ── Profil / Auth ────────────────────────────────────────────────────────────

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logoutAdmin() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) throw error
}

// ── Kourels ──────────────────────────────────────────────────────────────────

export async function fetchKourels() {
  console.log('[DEBUG] URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('[DEBUG] KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20) + '...')
  const { data, error } = await supabase
    .from('kourels')
    .select('*')
    .eq('actif', true)
    .order('id')
  console.log('[DEBUG] data:', data, '| error:', error)
  if (error) throw error
  return data
}

export async function ajouterKourel(nom, responsable) {
  const { data, error } = await supabase
    .from('kourels')
    .insert({ nom, responsable })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function modifierKourel(id, nom, responsable, telephone, callmebot_apikey) {
  const { error } = await supabase
    .from('kourels')
    .update({ nom, responsable, telephone, callmebot_apikey })
    .eq('id', id)
  if (error) throw error
}

export async function supprimerKourel(id) {
  const { error } = await supabase
    .from('kourels')
    .update({ actif: false })
    .eq('id', id)
  if (error) throw error
}

// ── Programme Annuel ─────────────────────────────────────────────────────────

export async function fetchProgramme(kourelId) {
  const { data, error } = await supabase
    .from('programme_annuel')
    .select('*')
    .eq('kourel_id', kourelId)
    .order('ordre')
  if (error) throw error
  return data
}

export async function ajouterKhassida(kourelId, nom, melodie, ordre) {
  const { data, error } = await supabase
    .from('programme_annuel')
    .insert({ kourel_id: kourelId, nom, melodie, ordre })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function modifierKhassida(id, nom, melodie) {
  const { error } = await supabase
    .from('programme_annuel')
    .update({ nom, melodie })
    .eq('id', id)
  if (error) throw error
}

export async function supprimerKhassida(id) {
  const { error } = await supabase
    .from('programme_annuel')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Membres du comité ────────────────────────────────────────────────────────

export async function fetchMembres() {
  const { data, error } = await supabase
    .from('membres')
    .select('*')
    .order('id')
  if (error) throw error
  return data
}

export async function ajouterMembre(prenom, nom, kourel, telephone, statut) {
  const { data, error } = await supabase
    .from('membres')
    .insert({ prenom, nom, kourel, telephone, statut: statut || 'actif' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function modifierMembre(id, updates) {
  const { error } = await supabase
    .from('membres')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerMembre(id) {
  const { error } = await supabase
    .from('membres')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Types d'événements ──────────────────────────────────────────────────────

export async function fetchTypesEvenements() {
  const { data, error } = await supabase
    .from('types_evenements')
    .select('*')
    .order('id')
  if (error) throw error
  return data
}

export async function ajouterTypeEvenement(nom, description) {
  const { data, error } = await supabase
    .from('types_evenements')
    .insert({ nom, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function modifierTypeEvenement(id, nom, description) {
  const { error } = await supabase
    .from('types_evenements')
    .update({ nom, description })
    .eq('id', id)
  if (error) throw error
}

export async function supprimerTypeEvenement(id) {
  const { error } = await supabase
    .from('types_evenements')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Lieux ────────────────────────────────────────────────────────────────────

export async function fetchLieux() {
  const { data, error } = await supabase
    .from('lieux')
    .select('*')
    .order('id')
  if (error) throw error
  return data
}

export async function ajouterLieu(nom) {
  const { data, error } = await supabase
    .from('lieux')
    .insert({ nom })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Événements ───────────────────────────────────────────────────────────────

export async function fetchEvenements() {
  const { data, error } = await supabase
    .from('evenements')
    .select('*, type:type_id(id, nom), lieu:lieu_id(id, nom), kourels:evenement_kourels(id, kourel:kourel_id(id, nom))')
    .order('date_evenement', { ascending: false })
  if (error) throw error
  return data
}

export async function ajouterEvenement(evenement) {
  const { data, error } = await supabase
    .from('evenements')
    .insert({
      type_id: evenement.type_id,
      date_evenement: evenement.date_evenement,
      lieu_id: evenement.lieu_id || null,
      statut: evenement.statut || 'à venir',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function ajouterEvenementKourel(evenementId, kourelId) {
  const { data, error } = await supabase
    .from('evenement_kourels')
    .insert({ evenement_id: evenementId, kourel_id: kourelId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function supprimerEvenementKourels(evenementId) {
  const { error } = await supabase
    .from('evenement_kourels')
    .delete()
    .eq('evenement_id', evenementId)
  if (error) throw error
}

export async function modifierEvenement(id, updates) {
  const { error } = await supabase
    .from('evenements')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerEvenement(id) {
  const { error } = await supabase
    .from('evenements')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Évaluateurs / Paginateurs par événement ─────────────────────────────────

export async function fetchEvalMembres(evenementId) {
  const { data: ekList, error: ekError } = await supabase
    .from('evenement_kourels')
    .select('id')
    .eq('evenement_id', evenementId)
  if (ekError) throw ekError
  const ids = (ekList || []).map(ek => ek.id)
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('eval_membres')
    .select('*, evenement_kourel:evenement_kourel_id(id, kourel:kourel_id(id, nom)), membre:membre_id(id, prenom, nom, kourel)')
    .in('evenement_kourel_id', ids)
  if (error) throw error
  return data
}

export async function assignerEvalMembre(evenementKourelId, membreId, role, codeAcces) {
  const { data, error } = await supabase
    .from('eval_membres')
    .insert({ evenement_kourel_id: evenementKourelId, membre_id: membreId, role, code_acces: codeAcces })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function supprimerEvalMembre(id) {
  const { error } = await supabase
    .from('eval_membres')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Critères d'évaluation ────────────────────────────────────────────────────

export async function fetchCriteres() {
  const { data, error } = await supabase
    .from('criteres')
    .select('*')
    .eq('actif', true)
    .order('ordre')
  if (error) throw error
  return data
}

export async function ajouterCritere(section_nom, description) {
  const { data, error } = await supabase
    .from('criteres')
    .insert({ section_nom, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function modifierCritere(id, updates) {
  const { error } = await supabase
    .from('criteres')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerCritere(id) {
  const { error } = await supabase
    .from('criteres')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Évaluations ──────────────────────────────────────────────────────────────

export async function fetchEvaluations(evenementId) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, membre:membre_id(id, prenom, nom, kourel), notes:evaluation_notes(*)')
    .eq('evenement_id', evenementId)
  if (error) throw error
  return data
}

export async function getOrCreateEvaluation(evenementId, membreId) {
  const { data: existing } = await supabase
    .from('evaluations')
    .select('*, notes:evaluation_notes(*)')
    .eq('evenement_id', evenementId)
    .eq('membre_id', membreId)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('evaluations')
    .insert({ evenement_id: evenementId, membre_id: membreId })
    .select('*, notes:evaluation_notes(*)')
    .single()
  if (error) throw error
  return data
}

export async function saveEvaluationNote(evaluationId, critereId, appreciation, note, remarques) {
  const { data, error } = await supabase
    .from('evaluation_notes')
    .upsert({
      evaluation_id: evaluationId,
      critere_id: critereId,
      appreciation: appreciation || null,
      note: note != null ? note : null,
      remarques: remarques || null,
    }, { onConflict: 'evaluation_id, critere_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function soumettreEvaluation(evaluationId, commentaire) {
  const { error } = await supabase
    .from('evaluations')
    .update({ soumis: true, commentaire })
    .eq('id', evaluationId)
  if (error) throw error
}

// ── Validation de code d'accès (côté client) ────────────────────────────────

export async function validerCodeAcces(code) {
  const { data, error } = await supabase
    .from('eval_membres')
    .select('*, evenement_kourel:evenement_kourel_id(*, evenement:evenement_id(*, type:type_id(id, nom), lieu:lieu_id(id, nom)), kourel:kourel_id(id, nom)), membre:membre_id(*)')
    .eq('code_acces', code.toUpperCase().trim())
    .maybeSingle()
  if (error) throw error
  return data
}
