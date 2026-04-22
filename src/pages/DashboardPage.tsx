import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { KpiCard } from '../components/KpiCard'
import { PageHeader } from '../components/PageHeader'
import { RevenueChart } from '../components/RevenueChart'
import { usePreferences } from '../hooks/usePreferences'
import { buildDashboardMetrics } from '../services/dashboardService'
import { fetchMaterials } from '../services/materialsService'
import { fetchPurchases } from '../services/purchasesService'
import { fetchSales } from '../services/salesService'
import type { DashboardMetrics } from '../types/database'

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

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const emptyMetrics: DashboardMetrics = {
  grossProfit: 0,
  lowStockAlerts: [],
  lowStockCount: 0,
  materialsValue: 0,
  profitMargin: 0,
  totalSales: 0,
  trend: [],
}

export function DashboardPage() {
  const { locale, t } = usePreferences()
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [materials, sales, purchases] = await Promise.all([
        fetchMaterials(),
        fetchSales(),
        fetchPurchases(),
      ])

      setMetrics(buildDashboardMetrics(materials, sales, purchases))
      setLoading(false)
    }

    void load()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label={t('dashboard.totalSales')} value={formatCurrency(metrics.totalSales, locale)} />
        <KpiCard label={t('dashboard.grossProfit')} value={formatCurrency(metrics.grossProfit, locale)} />
        <KpiCard label={t('dashboard.materialsValue')} value={formatCurrency(metrics.materialsValue, locale)} />
        <KpiCard label={t('dashboard.profitMargin')} value={formatPercent(metrics.profitMargin)} />
        <KpiCard label={t('dashboard.lowStock')} value={String(metrics.lowStockCount)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card
          title={t('dashboard.revenueTrend')}
          description={t('dashboard.revenueTrendDescription')}
        >
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.loading')}</p>
          ) : (
            <RevenueChart data={metrics.trend} />
          )}
        </Card>

        <Card
          title={t('dashboard.lowStockAlerts')}
          description={`${t('dashboard.lowStockDescription')} ${t('dashboard.lowStockThreshold')}: 25`}
        >
          {metrics.lowStockAlerts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.lowStockEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {metrics.lowStockAlerts.map((material) => (
                <div
                  key={material.id}
                  className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{material.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {material.stock} {material.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
