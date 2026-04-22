import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { loading, session } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4] p-6">
        <div className="panel w-full max-w-sm p-8 text-center">
          <p className="text-sm text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <>{children}</>
}
