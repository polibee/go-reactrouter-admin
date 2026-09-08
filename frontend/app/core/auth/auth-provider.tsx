import type React from 'react'
import { createContext, useEffect, useMemo, useState } from 'react'
import { hasPermission } from '~/core/permissions/permission.service'
import { authService, type AuthService } from './auth.service'
import { createAuthStore, useAuthStore } from './auth.store'
import type { AuthContextValue, AuthUser } from './auth.types'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  initialUser = null,
  service = authService,
  children,
}: {
  initialUser?: AuthUser | null
  service?: AuthService
  children: React.ReactNode
}) {
  const [store] = useState(() => createAuthStore(initialUser))
  const state = useAuthStore(store)

  useEffect(() => {
    if (initialUser) return

    let active = true
    store.setLoading(true)
    service
      .getCurrentUser()
      .then((user) => {
        if (active) store.setUser(user)
      })
      .catch(() => {
        if (active) store.setUser(null)
      })
      .finally(() => {
        if (active) store.setLoading(false)
      })

    return () => {
      active = false
    }
  }, [initialUser, service, store])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: !!state.user,
      isLoading: state.isLoading,
      login: (user) => store.setUser(user),
      logout: () => store.setUser(null),
      hasPermission: (permission) => hasPermission(state.user, permission),
      hasRole: (role) => !!state.user?.roles.includes(role),
    }),
    [state, store],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
