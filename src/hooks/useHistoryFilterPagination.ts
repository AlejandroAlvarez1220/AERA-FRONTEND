import { useMemo, useState } from 'react'

export type HistoryFilterMode = 'all' | 'month' | 'year' | 'range'

export interface UseHistoryFilterPaginationOptions<T> {
  data: T[]
  getDate: (item: T) => string | Date
  initialPageSize?: number
}

export function useHistoryFilterPagination<T>({
  data,
  getDate,
  initialPageSize = 10,
}: UseHistoryFilterPaginationOptions<T>) {
  const currentCalendarYear = new Date().getFullYear().toString()
  const currentCalendarMonth = new Date().getMonth().toString()

  const [filterMode, setFilterModeState] = useState<HistoryFilterMode>('all')
  const [selectedYear, setSelectedYearState] = useState<string>(currentCalendarYear)
  const [selectedMonth, setSelectedMonthState] = useState<string>(currentCalendarMonth)
  const [startDate, setStartDateState] = useState<string>('')
  const [endDate, setEndDateState] = useState<string>('')
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Extraer los años disponibles ordenados descendentemente
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>()
    yearsSet.add(currentCalendarYear)

    data.forEach((item) => {
      const rawDate = getDate(item)
      if (rawDate) {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear().toString())
        }
      }
    })

    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a))
  }, [data, getDate, currentCalendarYear])

  // Filtrado reactivo de datos
  const filteredData = useMemo(() => {
    if (filterMode === 'all') {
      return data
    }

    return data.filter((item) => {
      const rawDate = getDate(item)
      if (!rawDate) return false

      const itemDate = new Date(rawDate)
      if (isNaN(itemDate.getTime())) return false

      if (filterMode === 'year') {
        return itemDate.getFullYear().toString() === selectedYear
      }

      if (filterMode === 'month') {
        const yearMatches = itemDate.getFullYear().toString() === selectedYear
        const monthMatches = itemDate.getMonth().toString() === selectedMonth
        return yearMatches && monthMatches
      }

      if (filterMode === 'range') {
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`)
          if (itemDate < start) return false
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59.999`)
          if (itemDate > end) return false
        }
        return true
      }

      return true
    })
  }, [data, getDate, filterMode, selectedYear, selectedMonth, startDate, endDate])

  // Métricas de paginación
  const totalRecords = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  // Asegurar que la página actual no sobrepase el total de páginas
  const safeCurrentPage = Math.min(currentPage, totalPages)

  // Slice paginado
  const paginatedData = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize
    return filteredData.slice(startIdx, startIdx + pageSize)
  }, [filteredData, safeCurrentPage, pageSize])

  const startIndex = totalRecords === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endIndex = Math.min(safeCurrentPage * pageSize, totalRecords)
  const hasActiveFilters = filterMode !== 'all'

  // Setters con auto-reseteo a página 1
  const setFilterMode = (mode: HistoryFilterMode) => {
    setFilterModeState(mode)
    setCurrentPage(1)
  }

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year)
    setCurrentPage(1)
  }

  const setSelectedMonth = (month: string) => {
    setSelectedMonthState(month)
    setCurrentPage(1)
  }

  const setStartDate = (date: string) => {
    setStartDateState(date)
    setCurrentPage(1)
  }

  const setEndDate = (date: string) => {
    setEndDateState(date)
    setCurrentPage(1)
  }

  const setPageSize = (size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilterModeState('all')
    setSelectedYearState(currentCalendarYear)
    setSelectedMonthState(currentCalendarMonth)
    setStartDateState('')
    setEndDateState('')
    setCurrentPage(1)
  }

  const nextPage = () => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const prevPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clamped)
  }

  return {
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
    currentPage: safeCurrentPage,
    setCurrentPage: goToPage,
    totalPages,
    totalRecords,
    startIndex,
    endIndex,
    hasActiveFilters,
    resetFilters,
    availableYears,
    paginatedData,
    filteredData,
    nextPage,
    prevPage,
    canNextPage: safeCurrentPage < totalPages,
    canPrevPage: safeCurrentPage > 1,
  }
}
