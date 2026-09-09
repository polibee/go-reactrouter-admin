import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminConfig, type AdminConfig } from '~/config/admin.config'
import { useAuth } from '~/core/auth'
import { createAdminApp } from '~/core/extensions/extension.types'
import { adminModuleRegistry } from '~/modules'
import {
  loadEnabledPlugins,
  resetEnabledPlugins,
} from '~/plugin-runtime/runtime'
import { AdminContext } from './admin-context'
import type { AdminContextValue } from './admin.types'

let adminBootstrapped = false

function bootstrapAdmin(config: AdminConfig): void {
  if (adminBootstrapped) return
  adminBootstrapped = true
  adminModuleRegistry.bootstrap(createAdminApp(config))
}

export function AdminProvider({
  config = adminConfig,
  children,
}: {
  config?: AdminConfig
  children: React.ReactNode
}) {
  bootstrapAdmin(config)
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const locale = i18n.language
  const [pluginRuntimeState, setPluginRuntimeState] = useState<{
    isLoading: boolean
    error?: string
  }>({ isLoading: false })
  const pluginRequestGeneration = useRef(0)

  const reloadPlugins = useCallback(async () => {
    const requestGeneration = ++pluginRequestGeneration.current
    if (!user) {
      resetEnabledPlugins()
      setPluginRuntimeState({ isLoading: false })
      return
    }
    setPluginRuntimeState({ isLoading: true })
    try {
      await loadEnabledPlugins(config)
      if (requestGeneration !== pluginRequestGeneration.current) return
      setPluginRuntimeState({ isLoading: false })
    } catch (error) {
      if (requestGeneration !== pluginRequestGeneration.current) return
      resetEnabledPlugins()
      setPluginRuntimeState({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }, [config, user])

  useEffect(() => {
    void reloadPlugins()
    return () => {
      pluginRequestGeneration.current += 1
      resetEnabledPlugins()
    }
  }, [reloadPlugins])

  const value = useMemo<AdminContextValue>(
    () => ({
      config,
      user,
      locale,
      features: config.features,
      isFeatureEnabled: (feature) => !!config.features[feature],
      pluginRuntime: {
        ...pluginRuntimeState,
        reload: reloadPlugins,
      },
    }),
    [config, locale, pluginRuntimeState, reloadPlugins, user],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
