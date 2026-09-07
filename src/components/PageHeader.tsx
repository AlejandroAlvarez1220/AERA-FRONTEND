import { usePreferences } from '../hooks/usePreferences'

interface PageHeaderProps {
  description: string
  title: string
}

export function PageHeader({ description, title }: PageHeaderProps) {
  const { t } = usePreferences()

  return (
    <header className="flex flex-col gap-2 px-1">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
        {t('pageHeader.eyebrow')}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">{title}</h1>
      <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </header>
  )
}
