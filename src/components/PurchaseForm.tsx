import { useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import type { Material } from '../types/database'

interface PurchaseFormProps {
  isSaving: boolean
  onSubmit: (payload: {
    cost: number
    material_id: string
    quantity: number
  }) => Promise<void>
  materials: Material[]
}

export function PurchaseForm({ isSaving, onSubmit, materials }: PurchaseFormProps) {
  const { t } = usePreferences()
  const [materialId, setMaterialId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [cost, setCost] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      cost: Number(cost),
      material_id: materialId,
      quantity: Number(quantity),
    })

    setMaterialId('')
    setQuantity('1')
    setCost('')
  }

  return (
    <form className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="purchase-product">
          {t('purchaseForm.material')}
        </label>
        <select
          id="purchase-product"
          className="input"
          required
          value={materialId}
          onChange={(event) => setMaterialId(event.target.value)}
        >
          <option value="">{t('purchaseForm.selectMaterial')}</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name} ({material.unit})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="purchase-quantity">
          {t('purchaseForm.quantity')}
        </label>
        <input
          id="purchase-quantity"
          className="input"
          min="1"
          required
          step="1"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="purchase-cost">
          {t('purchaseForm.cost')}
        </label>
        <input
          id="purchase-cost"
          className="input"
          min="0"
          required
          step="0.01"
          type="number"
          value={cost}
          onChange={(event) => setCost(event.target.value)}
        />
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full md:w-auto" disabled={isSaving}>
          {isSaving ? t('purchaseForm.saving') : t('purchaseForm.submit')}
        </button>
      </div>
    </form>
  )
}
