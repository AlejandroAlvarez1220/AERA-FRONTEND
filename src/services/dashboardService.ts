import type {
  DashboardMetrics,
  InventoryRow,
  Material,
  Product,
  Purchase,
  Sale,
} from '../types/database'

const LOW_STOCK_THRESHOLD = 25

function averageCostByMaterial(purchases: Purchase[]) {
  const costMap = new Map<string, { totalCost: number; totalQuantity: number }>()

  purchases.forEach((purchase) => {
    const current = costMap.get(purchase.material_id) ?? { totalCost: 0, totalQuantity: 0 }
    current.totalCost += purchase.cost * purchase.quantity
    current.totalQuantity += purchase.quantity
    costMap.set(purchase.material_id, current)
  })

  return costMap
}

export function buildInventory(products: Product[], materials: Material[]) {
  const materialsById = new Map(materials.map((material) => [material.id, material]))

  return products.map<InventoryRow>((product) => {
    if (!product.product_materials || product.product_materials.length === 0) {
      return {
        bottleneckMaterial: '-',
        id: product.id,
        materialCount: 0,
        name: product.name,
        price: product.price,
        producibleUnits: 0,
      }
    }

    let minUnits = Number.POSITIVE_INFINITY
    let bottleneckMaterial = '-'

    product.product_materials.forEach((component) => {
      const material = materialsById.get(component.material_id)
      if (!material || component.quantity_required <= 0) {
        minUnits = 0
        bottleneckMaterial = component.materials?.name ?? '-'
        return
      }

      const availableUnits = Math.floor(material.stock / component.quantity_required)
      if (availableUnits < minUnits) {
        minUnits = availableUnits
        bottleneckMaterial = material.name
      }
    })

    return {
      bottleneckMaterial,
      id: product.id,
      materialCount: product.product_materials.length,
      name: product.name,
      price: product.price,
      producibleUnits: Number.isFinite(minUnits) ? Math.max(minUnits, 0) : 0,
    }
  })
}

export function buildDashboardMetrics(
  materials: Material[],
  sales: Sale[],
  purchases: Purchase[],
): DashboardMetrics {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalCost = purchases.reduce(
    (sum, purchase) => sum + purchase.quantity * purchase.cost,
    0,
  )
  const grossProfit = totalSales - totalCost
  const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0

  const costByMaterial = averageCostByMaterial(purchases)
  const materialsValue = materials.reduce((sum, material) => {
    const purchaseHistory = costByMaterial.get(material.id)
    const averageCost =
      purchaseHistory && purchaseHistory.totalQuantity > 0
        ? purchaseHistory.totalCost / purchaseHistory.totalQuantity
        : 0

    return sum + material.stock * averageCost
  }, 0)

  const lowStockAlerts = materials
    .filter((material) => material.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)

  const trendMap = new Map<string, number>()
  sales.forEach((sale) => {
    const label = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(sale.created_at))

    trendMap.set(label, (trendMap.get(label) ?? 0) + sale.total)
  })

  return {
    grossProfit,
    lowStockAlerts,
    lowStockCount: lowStockAlerts.length,
    materialsValue,
    profitMargin,
    totalSales,
    trend: Array.from(trendMap.entries())
      .map(([label, revenue]) => ({ label, revenue }))
      .slice(-7),
  }
}
