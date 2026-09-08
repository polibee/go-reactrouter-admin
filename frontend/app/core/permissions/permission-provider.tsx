import type React from 'react'
import { createContext, useMemo } from 'react'
import { useAuth } from '~/core/auth'
import { can, hasPermission } from './permission.service'

export interface PermissionContextValue {
  hasPermission: (permission?: string) => boolean
  can: (action: string, resource: string) => boolean
}

export const PermissionContext = createContext<PermissionContextValue | null>(
  null,
)

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  const value = useMemo<PermissionContextValue>(
    () => ({
      hasPermission: (permission) => hasPermission(user, permission),
      can: (action, resource) => can(user, action, resource),
    }),
    [user],
  )

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}
