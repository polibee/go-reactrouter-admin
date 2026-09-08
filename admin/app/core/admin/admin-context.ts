import { createContext, useContext } from 'react'
import type { AdminContextValue } from './admin.types'

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
