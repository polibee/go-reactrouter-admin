import { useContext } from 'react'
import { AuthContext } from './auth-provider'
import type { AuthContextValue } from './auth.types'

const guestAuthContextValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    return guestAuthContextValue
  }
  return context
}
