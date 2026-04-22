import { useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import type { Material, Product, ProductCompositionInput } from '../types/database'

interface DraftBomItem {
  material_id: string
  quantity_required: string
}

interface ProductFormProps {
  initialValue?: Product | null
  isSaving: boolean
  materials: Material[]
  onCancelEdit?: () => void
  onSubmit: (payload: {
    bom: ProductCompositionInput[]
    name: string
    price: number
  }) => Promise<void>
}

function buildInitialBom(product?: Product | null): DraftBomItem[] {
  if (!product?.product_materials || product.product_materials.length === 0) {
    return [{ material_id: '', quantity_required: '' }]
  }

  return product.product_materials.map((component) => ({
    material_id: component.material_id,
    quantity_required: component.quantity_required.toString(),
  }))
}

export function ProductForm({
  initialValue,
  isSaving,
  materials,
  onCancelEdit,
  onSubmit,
}: ProductFormProps) {
  const { t } = usePreferences()
  const [name, setName] = useState(initialValue?.name ?? '')
  const [price, setPrice] = useState(initialValue?.price?.toString() ?? '')
  const [bom, setBom] = useState<DraftBomItem[]>(buildInitialBom(initialValue))

  function updateBom(index: number, patch: Partial<DraftBomItem>) {
    setBom((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanedBom = bom
      .filter((item) => item.material_id && Number(item.quantity_required) > 0)
      .map((item) => ({
        material_id: item.material_id,
        quantity_required: Number(item.quantity_required),
      }))

    await onSubmit({
      bom: cleanedBom,
      name,
      price: Number(price),
    })

    if (!initialValue) {
      setName('')
      setPrice('')
      setBom([{ material_id: '', quantity_required: '' }])
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="product-name" className="label">
            {t('productForm.name')}
          </label>
          <input
            id="product-name"
            className="input"
            placeholder={t('productForm.placeholder')}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="product-price" className="label">
            {t('productForm.price')}
          </label>
          <input
            id="product-price"
            className="input"
            min="0"
            step="0.01"
            type="number"
            placeholder="0.00"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[28px] bg-slate-50 p-4 dark:bg-slate-900">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('productForm.composition')}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('productForm.emptyBom')}
          </p>
        </div>

        <div className="space-y-3">
          {bom.map((item, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1.5fr_1fr_auto]">
              <div>
                <label className="label" htmlFor={`product-material-${index}`}>
                  {t('purchaseForm.material')}
                </label>
                <select
                  id={`product-material-${index}`}
                  className="input"
                  required
                  value={item.material_id}
                  onChange={(event) => updateBom(index, { material_id: event.target.value })}
                >
                  <option value="">{t('productForm.selectMaterial')}</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor={`product-quantity-${index}`}>
                  {t('productForm.quantityRequired')}
                </label>
                <input
                  id={`product-quantity-${index}`}
                  className="input"
                  min="0"
                  step="0.001"
                  type="number"
                  required
                  value={item.quantity_required}
                  onChange={(event) =>
                    updateBom(index, { quantity_required: event.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="btn-secondary w-full md:w-auto"
                  onClick={() =>
                    setBom((current) =>
                      current.length === 1
                        ? current
                        : current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  {t('productForm.removeMaterial')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() =>
            setBom((current) => [...current, { material_id: '', quantity_required: '' }])
          }
        >
          {t('productForm.addMaterial')}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? t('productForm.save') : initialValue ? t('productForm.update') : t('productForm.add')}
        </button>
        {initialValue && onCancelEdit ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            {t('productForm.cancel')}
          </button>
        ) : null}
      </div>
    </form>
  )
}
