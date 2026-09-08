import type React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '~/core/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!isAuthenticated) {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    )
  }
  return <>{children}</>
}
