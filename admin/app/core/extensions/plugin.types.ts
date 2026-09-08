import type React from 'react'
import type { AdminConfig } from '~/config/admin.config'
import type { PluginState } from '~/core/api/contracts'
import type { NavItem } from '~/core/navigation/navigation.types'
import type { AnyAdminResource } from '~/core/registry/resource.registry'

export type PluginRuntimeMode = 'builtin' | 'external' | 'sandboxed'

export type PluginRuntimeState = PluginState

export interface RuntimePluginDescriptor {
  id: string
  name: string
  displayName: string
  version: string
  apiVersion: string
  runtime: PluginRuntimeMode
  state: PluginRuntimeState
  enabled: boolean
  trusted: boolean
  frontendEntrypoint?: string
}

export interface PluginPageDefinition {
  id: string
  path: string
  component: React.ComponentType
  permission?: string
}

export interface PluginFrontendApp {
  readonly config: AdminConfig
  registerResource(resource: AnyAdminResource): void
  registerPage(page: PluginPageDefinition): void
  registerNavigation(item: NavItem): void
  isFeatureEnabled(feature: keyof AdminConfig['features']): boolean
}

export interface PluginFrontendModule {
  register(app: PluginFrontendApp): void
}
