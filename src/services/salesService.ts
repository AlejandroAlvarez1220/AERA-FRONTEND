import { getSupabaseClient } from './supabaseClient'
import type {
  Material,
  MaterialAvailabilityResult,
  MaterialConsumption,
  MaterialShortage,
  Product,
  Sale,
} from '../types/database'

export interface SaleFormItem {
  price: number
  product_id: string
  quantity: number
}

function aggregateMaterialConsumption(items: SaleFormItem[], products: Product[]) {
  const consumptionMap = new Map<string, MaterialConsumption>()

  items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.product_id)
    if (!product) {
      return
    }

    product.product_materials?.forEach((component) => {
      const material = component.materials as Material | undefined
      if (!material) {
        return
      }

      const totalRequired = component.quantity_required * item.quantity
      const existing = consumptionMap.get(component.material_id)

      if (existing) {
        existing.total_required += totalRequired
      } else {
        consumptionMap.set(component.material_id, {
          material_id: component.material_id,
          material_name: material.name,
          material_stock: material.stock,
          quantity_required: component.quantity_required,
          total_required: totalRequired,
          unit: material.unit,
        })
      }
    })
  })

  return Array.from(consumptionMap.values())
}

export async function fetchSales() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, products(id, name, price))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Sale[]
}

export async function checkMaterialAvailability(
  items: SaleFormItem[],
): Promise<MaterialAvailabilityResult> {
  const supabase = getSupabaseClient()
  const productIds = Array.from(new Set(items.map((item) => item.product_id)))

  const { data, error } = await supabase
    .from('products')
    .select('id, name, product_materials(*, materials(id, name, stock, unit))')
    .in('id', productIds)

  if (error) throw error

  const products = (data ?? []) as Product[]
  const consumption = aggregateMaterialConsumption(items, products)
  const shortages: MaterialShortage[] = consumption
    .filter((entry) => entry.material_stock < entry.total_required)
    .map((entry) => ({
      ...entry,
      missing_quantity: entry.total_required - entry.material_stock,
    }))

  const missingBom = items.some((item) => {
    const product = products.find((entry) => entry.id === item.product_id)
    return !product || !product.product_materials || product.product_materials.length === 0
  })

  return {
    consumption,
    isValid: !missingBom && shortages.length === 0,
    shortages,
  }
}

export async function consumeMaterials(items: SaleFormItem[]) {
  const result = await checkMaterialAvailability(items)

  if (!result.isValid) {
    throw new Error('Insufficient materials')
  }

  return result.consumption
}

export async function createSale(items: SaleFormItem[]) {
  const supabase = getSupabaseClient()
  const availability = await checkMaterialAvailability(items)

  if (!availability.isValid) {
    throw new Error('Insufficient materials')
  }

  const { data, error } = await supabase.rpc('create_sale_with_consumption', {
    p_items: items,
  })

  if (error) throw error
  return data
}
