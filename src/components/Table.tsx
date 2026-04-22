import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyState: string
}

export function Table<T>({ columns, data, emptyState }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left dark:bg-slate-900">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {emptyState}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className="border-t border-slate-100 px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
