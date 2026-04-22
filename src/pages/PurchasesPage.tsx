import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { PurchaseForm } from '../components/PurchaseForm'
import { Table } from '../components/Table'
import { usePreferences } from '../hooks/usePreferences'
import { fetchMaterials } from '../services/materialsService'
import { createPurchase, fetchPurchases } from '../services/purchasesService'
import type { Material, Purchase } from '../types/database'

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

export function PurchasesPage() {
  const { locale, t } = usePreferences()
  const [materials, setMaterials] = useState<Material[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isSaving, setIsSaving] = useState(false)

  async function loadData() {
    const [materialData, purchaseData] = await Promise.all([
      fetchMaterials(),
      fetchPurchases(),
    ])

    setMaterials(materialData)
    setPurchases(purchaseData)
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleSubmit(payload: {
    cost: number
    material_id: string
    quantity: number
  }) {
    setIsSaving(true)
    try {
      await createPurchase(payload)
      await loadData()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('purchases.title')} description={t('purchases.description')} />

      <Card title={t('purchases.register')} description={t('purchases.registerDescription')}>
        <PurchaseForm isSaving={isSaving} materials={materials} onSubmit={handleSubmit} />
      </Card>

      <Card title={t('purchases.history')} description={t('purchases.historyDescription')}>
        <Table
          data={purchases}
          emptyState={t('purchases.empty')}
          columns={[
            {
              header: t('purchases.date'),
              render: (purchase) =>
                new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(purchase.created_at)),
            },
            {
              header: t('purchases.material'),
              render: (purchase) => purchase.materials?.name ?? t('purchases.material'),
            },
            {
              header: t('purchases.quantity'),
              render: (purchase) => `${purchase.quantity} ${purchase.materials?.unit ?? ''}`.trim(),
            },
            {
              header: t('purchases.cost'),
              render: (purchase) => formatCurrency(purchase.cost, locale),
            },
            {
              header: t('purchases.total'),
              render: (purchase) => formatCurrency(purchase.cost * purchase.quantity, locale),
            },
          ]}
        />
      </Card>
    </div>
  )
}
