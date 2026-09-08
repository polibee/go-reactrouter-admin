import type React from 'react'
import { createContext, useMemo, useState } from 'react'
import { hasPermission } from '~/core/permissions/permission.service'
import { mockAuthUser } from './auth.service'
import { createAuthStore, useAuthStore } from './auth.store'
import type { AuthContextValue, AuthUser } from './auth.types'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  initialUser = mockAuthUser,
  children,
}: {
  initialUser?: AuthUser | null
  children: React.ReactNode
}) {
  const [store] = useState(() => createAuthStore(initialUser))
  const state = useAuthStore(store)

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
