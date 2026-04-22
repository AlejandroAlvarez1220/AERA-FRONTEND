import { getSupabaseClient } from './supabaseClient'
import type { Product, ProductCompositionInput } from '../types/database'

export async function fetchProducts() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_materials(*, materials(id, name, stock, unit))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Product[]
}

export async function createProduct(payload: {
  bom: ProductCompositionInput[]
  name: string
  price: number
}) {
  const supabase = getSupabaseClient()
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      price: payload.price,
    })
    .select('id')
    .single()

  if (productError) throw productError

  if (payload.bom.length > 0) {
    const { error: bomError } = await supabase.from('product_materials').insert(
      payload.bom.map((item) => ({
        material_id: item.material_id,
        product_id: product.id,
        quantity_required: item.quantity_required,
      })),
    )

    if (bomError) throw bomError
  }
}

export async function updateProduct(
  id: string,
  payload: {
    bom: ProductCompositionInput[]
    name: string
    price: number
  },
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('products')
    .update({
      name: payload.name,
      price: payload.price,
    })
    .eq('id', id)

  if (error) throw error

  const { error: deleteBomError } = await supabase
    .from('product_materials')
    .delete()
    .eq('product_id', id)

  if (deleteBomError) throw deleteBomError

  if (payload.bom.length > 0) {
    const { error: bomError } = await supabase.from('product_materials').insert(
      payload.bom.map((item) => ({
        material_id: item.material_id,
        product_id: id,
        quantity_required: item.quantity_required,
      })),
    )

    if (bomError) throw bomError
  }
}

export async function deleteProduct(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
