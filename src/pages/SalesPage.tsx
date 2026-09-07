import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { HistoryFilterToolbar } from '../components/HistoryFilterToolbar'
import { PageHeader } from '../components/PageHeader'
import { PaginationControls } from '../components/PaginationControls'
import { SaleForm } from '../components/SaleForm'
import { Table } from '../components/Table'
import { useHistoryFilterPagination } from '../hooks/useHistoryFilterPagination'
import { usePreferences } from '../hooks/usePreferences'
import { fetchProducts } from '../services/productsService'
import { createSale, fetchSales } from '../services/salesService'
import type { Product, Sale } from '../types/database'

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

export function SalesPage() {
  const { locale, t } = usePreferences()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadData() {
    const [productData, salesData] = await Promise.all([fetchProducts(), fetchSales()])
    setProducts(productData)
    setSales(salesData)
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleSubmit(
    items: Array<{ price: number; product_id: string; quantity: number }>,
  ) {
    setIsSaving(true)
    setErrorMessage(null)
    try {
      await createSale(items)
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('sales.validationError'))
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
    data: sales,
    getDate: (sale) => sale.created_at,
    initialPageSize: 10,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sales.title')}
        description={t('sales.description')}
      />

      <Card
        title={t('sales.newSale')}
        description={t('sales.newSaleDescription')}
      >
        <SaleForm
          errorMessage={errorMessage}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          products={products}
        />
      </Card>

      <Card title={t('sales.history')} description={t('sales.historyDescription')}>
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
          emptyState={hasActiveFilters ? t('filters.noResults') : t('sales.empty')}
          columns={[
            {
              header: t('sales.date'),
              render: (sale) =>
                new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(sale.created_at)),
            },
            {
              header: t('sales.items'),
              render: (sale) => (
                <div className="space-y-1">
                  {sale.sale_items?.map((item) => (
                    <p key={item.id}>
                      {item.products?.name ?? t('sales.productFallback')} x {item.quantity} at{' '}
                      {formatCurrency(item.price, locale)}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              header: t('sales.total'),
              render: (sale) => (
                <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(sale.total, locale)}</span>
              ),
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
