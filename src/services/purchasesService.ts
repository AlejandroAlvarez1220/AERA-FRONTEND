import { getSupabaseClient } from './supabaseClient'
import type { Purchase } from '../types/database'

export async function fetchPurchases() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*, materials(id, name, stock, unit)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Purchase[]
}

export async function createPurchase(payload: {
  cost: number
  material_id: string
  quantity: number
}) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('purchases').insert(payload)
  if (error) throw error

  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('stock')
    .eq('id', payload.material_id)
    .single()

  if (materialError) throw materialError

  const { error: stockError } = await supabase
    .from('materials')
    .update({
      stock: Number(material.stock) + payload.quantity,
    })
    .eq('id', payload.material_id)

  if (stockError) throw stockError
}
