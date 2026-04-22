interface KpiCardProps {
  label: string
  value: string
}

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="panel p-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}
