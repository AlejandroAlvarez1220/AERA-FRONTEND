import { usePreferences } from '../hooks/usePreferences'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  startIndex: number
  endIndex: number
  onPrevPage: () => void
  onNextPage: () => void
  canPrevPage: boolean
  canNextPage: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalRecords,
  startIndex,
  endIndex,
  onPrevPage,
  onNextPage,
  canPrevPage,
  canNextPage,
}: PaginationControlsProps) {
  const { t } = usePreferences()

  if (totalRecords === 0) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      {/* Resumen de registros */}
      <div>
        <span>
          {t('table.showing')} <strong className="font-semibold text-slate-800 dark:text-slate-200">{startIndex}</strong> -{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</strong> {t('table.of')}{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalRecords}</strong> {t('table.records')}
        </span>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-3">
        <span>
          {t('table.page')} <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</strong> {t('table.of')}{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn-secondary !py-1.5 !px-3 !text-xs"
            onClick={onPrevPage}
            disabled={!canPrevPage}
            aria-label={t('table.prev')}
          >
            ← {t('table.prev')}
          </button>
          <button
            type="button"
            className="btn-secondary !py-1.5 !px-3 !text-xs"
            onClick={onNextPage}
            disabled={!canNextPage}
            aria-label={t('table.next')}
          >
            {t('table.next')} →
          </button>
        </div>
      </div>
    </div>
  )
}
