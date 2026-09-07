interface KpiCardProps {
  label: string
  value: string
}

export function KpiCard({ label, value }: KpiCardProps) {
  // Ajuste inteligente del tamaño de tipografía según la longitud del valor
  // para garantizar que números grandes se muestren completos sin cortarse ni desbordar
  const getValueSizeClass = (val: string) => {
    const len = val.length
    if (len >= 14) return 'text-lg sm:text-xl xl:text-lg 2xl:text-xl'
    if (len >= 10) return 'text-xl sm:text-2xl xl:text-xl 2xl:text-2xl'
    return 'text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl'
  }

  return (
    <div className="panel flex min-w-0 flex-col justify-between p-4 sm:p-5">
      <p className="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400" title={label}>
        {label}
      </p>
      <p
        className={`mt-2 font-semibold tracking-tight tabular-nums text-slate-950 dark:text-white ${getValueSizeClass(
          value
        )}`}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

