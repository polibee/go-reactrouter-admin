import { useContext } from 'react'
import type { PermissionContextValue } from './permission-provider'
import { PermissionContext } from './permission-provider'

export function usePermission(): PermissionContextValue {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}
