export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          created_at: string
          id: string
          name: string
          stock: number
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          stock?: number
          unit: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          stock?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      product_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
          quantity_required: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
          quantity_required: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
          quantity_required?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_materials_material_id_fkey'
            columns: ['material_id']
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_materials_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          cost: number
          created_at: string
          id: string
          material_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          material_id: string
          quantity: number
          user_id?: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          material_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'purchases_material_id_fkey'
            columns: ['material_id']
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          sale_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sale_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_sale_id_fkey'
            columns: ['sale_id']
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          id: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_sale_with_consumption: {
        Args: {
          p_items: Array<{
            price: number
            product_id: string
            quantity: number
          }>
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Material {
  created_at: string
  id: string
  name: string
  stock: number
  unit: string
  user_id: string
}

export interface ProductMaterial {
  created_at?: string
  id: string
  material_id: string
  product_id: string
  quantity_required: number
  user_id?: string
  materials?: Pick<Material, 'id' | 'name' | 'stock' | 'unit'>
}

export interface Product {
  created_at: string
  id: string
  name: string
  price: number
  product_materials?: ProductMaterial[]
  updated_at: string
  user_id: string
}

export interface Purchase {
  cost: number
  created_at: string
  id: string
  material_id: string
  materials?: Pick<Material, 'id' | 'name' | 'stock' | 'unit'>
  quantity: number
  user_id: string
}

export interface Sale {
  created_at: string
  id: string
  total: number
  user_id: string
  sale_items?: SaleItem[]
}

export interface SaleItem {
  created_at: string
  id: string
  price: number
  product_id: string
  products?: Pick<Product, 'id' | 'name' | 'price'>
  quantity: number
  sale_id: string
  user_id: string
}

export interface ProductCompositionInput {
  material_id: string
  quantity_required: number
}

export interface MaterialConsumption {
  material_id: string
  material_name: string
  material_stock: number
  quantity_required: number
  total_required: number
  unit: string
}

export interface MaterialShortage extends MaterialConsumption {
  missing_quantity: number
}

export interface MaterialAvailabilityResult {
  consumption: MaterialConsumption[]
  isValid: boolean
  shortages: MaterialShortage[]
}

export interface DashboardMetrics {
  grossProfit: number
  lowStockAlerts: Material[]
  lowStockCount: number
  materialsValue: number
  profitMargin: number
  totalSales: number
  trend: Array<{
    label: string
    revenue: number
  }>
}

export interface InventoryRow {
  bottleneckMaterial: string
  id: string
  materialCount: number
  name: string
  price: number
  producibleUnits: number
}
