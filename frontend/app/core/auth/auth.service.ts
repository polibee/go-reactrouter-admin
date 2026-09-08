// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
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

export const mockAuthUser: AuthUser = {
  id: 'usr_admin_1',
  name: 'Admin User',
  email: 'admin@antigravity.dev',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  roles: ['super_admin', 'admin'],
  permissions: ['*'], // Super admin has all permissions
}

export class MockAuthService implements AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    return mockAuthUser
  }

  async login(credentials: Credentials): Promise<AuthUser> {
    return { ...mockAuthUser, email: credentials.email || mockAuthUser.email }
  }

  async logout(): Promise<void> {}
}

export const mockAuthService = new MockAuthService()
