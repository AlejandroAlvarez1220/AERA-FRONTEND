import { useMemo } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import type { HistoryFilterMode } from '../hooks/useHistoryFilterPagination'

interface HistoryFilterToolbarProps {
  filterMode: HistoryFilterMode
  onFilterModeChange: (mode: HistoryFilterMode) => void
  selectedYear: string
  onYearChange: (year: string) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
  startDate: string
  onStartDateChange: (date: string) => void
  endDate: string
  onEndDateChange: (date: string) => void
  availableYears: string[]
  pageSize: number
  onPageSizeChange: (size: number) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function HistoryFilterToolbar({
  filterMode,
  onFilterModeChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  availableYears,
  pageSize,
  onPageSizeChange,
  hasActiveFilters,
  onResetFilters,
}: HistoryFilterToolbarProps) {
  const { locale, t } = usePreferences()

  // Generar nombres de meses traducidos dinámicamente según el locale
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(2026, index, 1)
      const label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
      // Capitalizar la primera letra
      return {
        value: index.toString(),
        label: label.charAt(0).toUpperCase() + label.slice(1),
      }
    })
  }, [locale])

  const pageSizeOptions = [5, 10, 15, 20]

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filtros de Fecha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de modo de filtro */}
          <div className="min-w-[150px]">
            <select
              className="input !py-2 !text-xs font-medium"
              value={filterMode}
              onChange={(e) => onFilterModeChange(e.target.value as HistoryFilterMode)}
              aria-label={t('filters.filterBy')}
            >
              <option value="all">{t('filters.all')}</option>
              <option value="month">{t('filters.byMonth')}</option>
              <option value="year">{t('filters.byYear')}</option>
              <option value="range">{t('filters.customRange')}</option>
            </select>
          </div>

          {/* Controles cuando el modo es 'month' */}
          {filterMode === 'month' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="input !w-auto !py-2 !text-xs"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                aria-label={t('filters.month')}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="input !w-auto !py-2 !text-xs"
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                aria-label={t('filters.year')}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Controles cuando el modo es 'year' */}
          {filterMode === 'year' && (
            <div className="flex items-center gap-2">
              <select
                className="input !w-auto !py-2 !text-xs"
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                aria-label={t('filters.year')}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Controles cuando el modo es 'range' */}
          {filterMode === 'range' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('filters.startDate')}:
                </span>
                <input
                  type="date"
                  className="input !w-auto !py-1.5 !text-xs"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('filters.endDate')}:
                </span>
                <input
                  type="date"
                  className="input !w-auto !py-1.5 !text-xs"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              ✕ {t('filters.clear')}
            </button>
          )}
        </div>

        {/* Selector de límite de registros por página */}
        <div className="ml-auto flex items-center gap-2">
          <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
            {t('table.perPage')}:
          </span>
          <select
            className="input !w-auto !py-1.5 !px-3 !text-xs font-medium"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label={t('table.perPage')}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
