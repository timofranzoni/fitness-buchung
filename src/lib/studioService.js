import { supabase } from './supabase.js'

export async function fetchStudioBySlug(slug) {
  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error) return null
  return data
}

export async function fetchAllStudios() {
  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createStudio({ slug, name, ownerEmail }) {
  const { data, error } = await supabase
    .from('studios')
    .insert({ slug, name, owner_email: ownerEmail })
    .select()
    .single()
  if (error) throw error

  // Default-Einstellungen für neues Studio anlegen
  await supabase
    .from('studio_settings')
    .insert({ studio_id: data.id, name })

  return data
}

export async function updateStudio(id, updates) {
  const { data, error } = await supabase
    .from('studios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudio(id) {
  const { error } = await supabase.from('studios').delete().eq('id', id)
  if (error) throw error
}

export async function getMyStudios() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('studio_users')
    .select('role, studio_id, studios(*)')
    .eq('user_id', user.id)
  if (error) return []
  return data ?? []
}

export async function assignStudioAdmin(email, studioId) {
  const { error } = await supabase.rpc('assign_studio_admin', {
    p_email: email,
    p_studio_id: studioId,
  })
  if (error) throw error
}
