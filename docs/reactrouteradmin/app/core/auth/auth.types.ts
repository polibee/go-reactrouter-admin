export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  login: (user: AuthUser) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}
