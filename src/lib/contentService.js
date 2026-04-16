import { supabase } from './supabase.js'

export async function fetchContent(studioId) {
  const { data, error } = await supabase
    .from('studio_content')
    .select('content')
    .eq('studio_id', studioId)
    .single()
  if (error) return null
  return data?.content ?? null
}

export async function saveContent(studioId, content) {
  const { error } = await supabase
    .from('studio_content')
    .upsert({ studio_id: studioId, content, updated_at: new Date().toISOString() })
    .eq('studio_id', studioId)
  if (error) throw error
}
