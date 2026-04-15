import { supabase } from './supabase.js'

export async function fetchSettings(studioId) {
  const { data, error } = await supabase
    .from('studio_settings')
    .select('*')
    .eq('studio_id', studioId)
    .single()
  if (error) return null
  return data
}

export async function saveSettings(studioId, updates) {
  const { data, error } = await supabase
    .from('studio_settings')
    .upsert({ studio_id: studioId, ...updates, updated_at: new Date().toISOString() })
    .eq('studio_id', studioId)
    .select()
    .single()
  if (error) throw error
  return data
}
