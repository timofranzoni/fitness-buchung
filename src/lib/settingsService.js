import { supabase } from './supabase.js'

export async function fetchSettings() {
  const { data, error } = await supabase
    .from('studio_settings')
    .select('*')
    .single()
  if (error) return null
  return data
}

export async function saveSettings(updates) {
  const { data, error } = await supabase
    .from('studio_settings')
    .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}
