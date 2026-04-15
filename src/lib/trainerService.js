import { supabase } from './supabase.js'
import { TRAINERS } from '../data/trainers.js'

export async function fetchTrainers() {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error || !data || data.length === 0) return TRAINERS
  return data
}

export async function createTrainer(trainer) {
  const { data, error } = await supabase
    .from('trainers')
    .insert({ ...trainer, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTrainer(id, updates) {
  const { data, error } = await supabase
    .from('trainers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrainer(id) {
  const { error } = await supabase.from('trainers').delete().eq('id', id)
  if (error) throw error
}
