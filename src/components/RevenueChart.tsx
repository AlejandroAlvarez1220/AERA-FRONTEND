import { usePreferences } from '../hooks/usePreferences'

interface RevenueChartProps {
  data: Array<{
    label: string
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = usePreferences()

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[28px] bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('revenue.empty')}</p>
      </div>
    )
  }

  const width = 720
  const height = 240
  const padding = 24
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1)
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

  const coordinates = data.map((point, index) => {
    const x = padding + index * stepX
    const y =
      height - padding - (point.revenue / maxRevenue) * (height - padding * 2)

    return { x, y }
  })

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${
    height - padding
  } Z`

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[28px] bg-slate-50 p-4 dark:bg-slate-900">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#111827" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#revenue-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#111827"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {coordinates.map((point) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="#111827" />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 sm:grid-cols-4 lg:grid-cols-7">
        {data.map((point) => (
          <div key={point.label} className="rounded-2xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-900">
            {point.label}
          </div>
        ))}
      </div>
    </div>
  )
}
