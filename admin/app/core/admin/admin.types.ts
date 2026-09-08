import type { AdminConfig } from '~/config/admin.config'
import type { AuthUser } from '~/core/auth'

export interface AdminContextValue {
  config: AdminConfig
  user: AuthUser | null
  locale: string
  features: AdminConfig['features']
  isFeatureEnabled: (feature: keyof AdminConfig['features']) => boolean
}
