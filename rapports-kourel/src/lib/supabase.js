import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

// ── Kourels ──────────────────────────────────────────────────────────────────

export async function fetchKourels() {
  const { data, error } = await supabase
    .from('kourels')
    .select('*')
    .eq('actif', true)
    .order('id')
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

export async function modifierKourel(id, nom, responsable) {
  const { error } = await supabase
    .from('kourels')
    .update({ nom, responsable })
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

// ── Auth Admin ────────────────────────────────────────────────────────────────

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
