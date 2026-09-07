import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { ProductForm } from '../components/ProductForm'
import { Table } from '../components/Table'
import { usePreferences } from '../hooks/usePreferences'
import { fetchMaterials } from '../services/materialsService'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../services/productsService'
import type { Material, Product } from '../types/database'

function formatCurrency(value: number, locale: string) {
  const hasDecimals = Math.abs(value % 1) > 0.000001
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value)

  return locale.startsWith('es') ? formatted.replace('US$', '$').trim() : formatted
}

export function ProductsPage() {
  const { locale, t } = usePreferences()
  const [materials, setMaterials] = useState<Material[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function loadProducts() {
    const [productData, materialData] = await Promise.all([fetchProducts(), fetchMaterials()])
    setProducts(productData)
    setMaterials(materialData)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  async function handleSubmit(payload: {
    bom: Array<{ material_id: string; quantity_required: number }>
    name: string
    price: number
  }) {
    setIsSaving(true)

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        setEditingProduct(null)
      } else {
        await createProduct(payload)
      }

      await loadProducts()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(productId: string) {
    await deleteProduct(productId)
    await loadProducts()
    if (editingProduct?.id === productId) {
      setEditingProduct(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
      />

      <Card
        title={editingProduct ? t('products.edit') : t('products.add')}
        description={t('products.formDescription')}
      >
        <ProductForm
          key={editingProduct?.id ?? 'new-product'}
          initialValue={editingProduct}
          isSaving={isSaving}
          materials={materials}
          onCancelEdit={() => setEditingProduct(null)}
          onSubmit={handleSubmit}
        />
      </Card>

      <Card title={t('products.catalog')} description={t('products.catalogDescription')}>
        <Table
          data={products}
          emptyState={t('products.empty')}
          columns={[
            {
              header: t('products.name'),
              render: (product) => <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>,
            },
            {
              header: t('products.price'),
              render: (product) => formatCurrency(product.price, locale),
            },
            {
              header: t('products.bom'),
              render: (product) =>
                product.product_materials && product.product_materials.length > 0 ? (
                  <div className="space-y-1">
                    {product.product_materials.map((component) => (
                      <p key={component.id}>
                        {component.materials?.name} - {component.quantity_required}{' '}
                        {component.materials?.unit}
                      </p>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">{t('products.bomEmpty')}</span>
                ),
            },
            {
              header: t('products.actions'),
              render: (product) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2"
                    onClick={() => setEditingProduct(product)}
                  >
                    {t('products.editAction')}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950"
                    onClick={() => void handleDelete(product.id)}
                  >
                    {t('products.deleteAction')}
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
