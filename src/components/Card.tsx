import type { PropsWithChildren, ReactNode } from 'react'

interface CardProps extends PropsWithChildren {
  action?: ReactNode
  description?: string
  title: string
}

export function Card({ action, children, description, title }: CardProps) {
  return (
    <section className="panel p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
