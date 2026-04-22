import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { usePreferences } from '../hooks/usePreferences'
import { buildInventory } from '../services/dashboardService'
import { fetchMaterials } from '../services/materialsService'
import { fetchProducts } from '../services/productsService'
import type { InventoryRow } from '../types/database'

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

export function InventoryPage() {
  const { locale, t } = usePreferences()
  const [rows, setRows] = useState<InventoryRow[]>([])

  useEffect(() => {
    async function load() {
      const [products, materials] = await Promise.all([fetchProducts(), fetchMaterials()])
      setRows(buildInventory(products, materials))
    }

    void load()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title={t('inventory.title')} description={t('inventory.description')} />

      <Card title={t('inventory.overview')} description={t('inventory.overviewDescription')}>
        <Table
          data={rows}
          emptyState={t('inventory.empty')}
          columns={[
            {
              header: t('inventory.product'),
              render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>,
            },
            {
              header: t('inventory.materialCount'),
              render: (row) => row.materialCount,
            },
            {
              header: t('inventory.producibleUnits'),
              render: (row) => (
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {row.producibleUnits}
                </span>
              ),
            },
            {
              header: t('inventory.bottleneck'),
              render: (row) => row.bottleneckMaterial,
            },
            {
              header: t('inventory.value'),
              render: (row) => formatCurrency(row.producibleUnits * row.price, locale),
            },
          ]}
        />
      </Card>
    </div>
  )
}
