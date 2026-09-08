import type React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminConfig, type AdminConfig } from '~/config/admin.config'
import { useAuth } from '~/core/auth'
import { registerStaticNavigation } from '~/core/navigation/static-navigation'
import { registerAllResources } from '~/resources'
import { AdminContext } from './admin-context'
import type { AdminContextValue } from './admin.types'

let adminBootstrapped = false

function bootstrapAdmin(): void {
  if (adminBootstrapped) return
  adminBootstrapped = true
  registerStaticNavigation()
  registerAllResources()
}

export function AdminProvider({
  config = adminConfig,
  children,
}: {
  config?: AdminConfig
  children: React.ReactNode
}) {
  bootstrapAdmin()
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const locale = i18n.language

  const value = useMemo<AdminContextValue>(
    () => ({
      config,
      user,
      locale,
      features: config.features,
      isFeatureEnabled: (feature) => !!config.features[feature],
    }),
    [config, user, locale],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
