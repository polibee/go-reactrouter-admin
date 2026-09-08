import { api } from '~/core/api'
import { ApiError } from '~/core/api/errors'
import type { AuthUser } from './auth.types'

export interface Credentials {
  email: string
  password: string
}

export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>
  login(credentials: Credentials): Promise<AuthUser>
  logout(): Promise<void>
}

export class GoravelAuthService implements AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await api.get<AuthUser>('/api/v1/auth/me')
      return response.data
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  }

  async login(credentials: Credentials): Promise<AuthUser> {
    const response = await api.post<AuthUser>('/api/v1/auth/login', credentials)
    return response.data
  }

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout')
  }
}

export const authService = new GoravelAuthService()
