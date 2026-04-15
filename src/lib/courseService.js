import { supabase } from './supabase.js'
import { COURSES } from '../data/courses.js'

export async function fetchCourses(studioId) {
  let query = supabase.from('courses').select('*').order('created_at', { ascending: true })
  if (studioId) query = query.eq('studio_id', studioId)

  const { data, error } = await query
  if (error || !data || data.length === 0) {
    console.warn('DB-Kurse nicht verfügbar, nutze statische Daten:', error?.message)
    return COURSES
  }
  return data
}

export async function createCourse(studioId, course) {
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...course, studio_id: studioId, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(id, updates) {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCourse(id) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}
