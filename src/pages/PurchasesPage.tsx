import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { HistoryFilterToolbar } from '../components/HistoryFilterToolbar'
import { PageHeader } from '../components/PageHeader'
import { PaginationControls } from '../components/PaginationControls'
import { PurchaseForm } from '../components/PurchaseForm'
import { Table } from '../components/Table'
import { useHistoryFilterPagination } from '../hooks/useHistoryFilterPagination'
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

  const {
    filterMode,
    setFilterMode,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pageSize,
    setPageSize,
    currentPage,
    totalPages,
    totalRecords,
    startIndex,
    endIndex,
    hasActiveFilters,
    resetFilters,
    availableYears,
    paginatedData,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
  } = useHistoryFilterPagination({
    data: purchases,
    getDate: (purchase) => purchase.created_at,
    initialPageSize: 10,
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('purchases.title')} description={t('purchases.description')} />

      <Card title={t('purchases.register')} description={t('purchases.registerDescription')}>
        <PurchaseForm isSaving={isSaving} materials={materials} onSubmit={handleSubmit} />
      </Card>

      <Card title={t('purchases.history')} description={t('purchases.historyDescription')}>
        <HistoryFilterToolbar
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          availableYears={availableYears}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />

        <Table
          data={paginatedData}
          emptyState={hasActiveFilters ? t('filters.noResults') : t('purchases.empty')}
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

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          startIndex={startIndex}
          endIndex={endIndex}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          canPrevPage={canPrevPage}
          canNextPage={canNextPage}
        />
      </Card>
    </div>
  )
}
