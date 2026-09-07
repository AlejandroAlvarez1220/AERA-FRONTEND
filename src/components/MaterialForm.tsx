import { useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import type { Material } from '../types/database'

interface MaterialFormProps {
  initialValue?: Material | null
  isSaving: boolean
  onCancelEdit?: () => void
  onSubmit: (payload: { name: string; stock: number; unit: string }) => Promise<void>
}

export function MaterialForm({
  initialValue,
  isSaving,
  onCancelEdit,
  onSubmit,
}: MaterialFormProps) {
  const { t } = usePreferences()
  const [name, setName] = useState(initialValue?.name ?? '')
  const [stock, setStock] = useState(initialValue?.stock?.toString() ?? '')
  const [unit, setUnit] = useState(initialValue?.unit ?? '')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      name,
      stock: Number(stock),
      unit,
    })

    if (!initialValue) {
      setName('')
      setStock('')
      setUnit('')
    }
  }

  return (
    <form className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="material-name" className="label">
          {t('materialForm.name')}
        </label>
        <input
          id="material-name"
          className="input"
          placeholder={t('materialForm.placeholder')}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="material-stock" className="label">
          {t('materialForm.stock')}
        </label>
        <input
          id="material-stock"
          className="input"
          min="0"
          step="0.001"
          type="number"
          required
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="material-unit" className="label">
          {t('materialForm.unit')}
        </label>
        <input
          id="material-unit"
          className="input"
          placeholder={t('materialForm.unitPlaceholder')}
          required
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
        />
      </div>
      <div className="flex items-end gap-3">
        <button type="submit" className="btn-primary w-full md:w-auto" disabled={isSaving}>
          {isSaving ? t('materialForm.save') : initialValue ? t('materialForm.update') : t('materialForm.add')}
        </button>
        {initialValue && onCancelEdit ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            {t('materialForm.cancel')}
          </button>
        ) : null}
      </div>
    </form>
  )
}
