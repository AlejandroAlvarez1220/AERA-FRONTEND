import { getSupabaseClient } from './supabaseClient'
import type { Material } from '../types/database'

export async function fetchMaterials() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Material[]
}

export async function createMaterial(payload: Pick<Material, 'name' | 'stock' | 'unit'>) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('materials').insert(payload)
  if (error) throw error
}

export async function updateMaterial(
  id: string,
  payload: Partial<Pick<Material, 'name' | 'stock' | 'unit'>>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('materials').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteMaterial(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}
