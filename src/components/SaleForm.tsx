import { useMemo, useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import type { Product } from '../types/database'
import type { SaleFormItem } from '../services/salesService'

interface DraftSaleLine {
  price: string
  product_id: string
  quantity: string
}

interface SaleFormProps {
  errorMessage?: string | null
  isSaving: boolean
  onSubmit: (items: SaleFormItem[]) => Promise<void>
  products: Product[]
}

const createEmptyLine = (): DraftSaleLine => ({
  price: '',
  product_id: '',
  quantity: '1',
})

export function SaleForm({ errorMessage, isSaving, onSubmit, products }: SaleFormProps) {
  const { t } = usePreferences()
  const [items, setItems] = useState<DraftSaleLine[]>([createEmptyLine()])

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0
        const price = Number(item.price) || 0
        return sum + quantity * price
      }, 0),
    [items],
  )

  function updateLine(index: number, patch: Partial<DraftSaleLine>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    )
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((entry) => entry.id === productId)
    updateLine(index, {
      product_id: productId,
      price: product ? product.price.toString() : '',
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = items.map((item) => ({
      price: Number(item.price),
      product_id: item.product_id,
      quantity: Number(item.quantity),
    }))

    await onSubmit(payload)
    setItems([createEmptyLine()])
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
            <div>
              <label className="label" htmlFor={`sale-product-${index}`}>
                {t('saleForm.product')}
              </label>
              <select
                id={`sale-product-${index}`}
                className="input"
                required
                value={item.product_id}
                onChange={(event) => handleProductChange(index, event.target.value)}
              >
                <option value="">{t('saleForm.selectProduct')}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor={`sale-quantity-${index}`}>
                {t('saleForm.quantity')}
              </label>
              <input
                id={`sale-quantity-${index}`}
                className="input"
                min="1"
                required
                step="1"
                type="number"
                value={item.quantity}
                onChange={(event) => updateLine(index, { quantity: event.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor={`sale-price-${index}`}>
                {t('saleForm.price')}
              </label>
              <input
                id={`sale-price-${index}`}
                className="input"
                min="0"
                required
                step="0.01"
                type="number"
                value={item.price}
                onChange={(event) => updateLine(index, { price: event.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() =>
                  setItems((current) =>
                    current.length === 1
                      ? current
                      : current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                {t('saleForm.remove')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] bg-slate-50 p-4 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setItems((current) => [...current, createEmptyLine()])}
        >
          {t('saleForm.addLine')}
        </button>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('saleForm.calculatedTotal')}</p>
          <p className="text-2xl font-semibold text-slate-950 dark:text-white">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        {errorMessage ? errorMessage : t('saleForm.validationHint')}
      </div>

      <button type="submit" className="btn-primary" disabled={isSaving || products.length === 0}>
        {isSaving ? t('saleForm.saving') : t('saleForm.submit')}
      </button>
    </form>
  )
}
