import type { AdminConfig } from '~/config/admin.config'
import { navigationRegistry } from '~/core/navigation/navigation-registry'
import type { NavGroup } from '~/core/navigation/navigation.types'
import type { AnyAdminResource } from '~/core/registry/resource.registry'
import { resourceRegistry } from '~/core/registry/resource.registry'

export interface AdminExtension {
  name: string
  version?: string
  resources?: AnyAdminResource[]
  navigation?: NavGroup[]
  onRegister?(app: AdminApp): void
}

export interface AdminApp {
  readonly config: AdminConfig
  registerResource(resource: AnyAdminResource): void
  getResource(name: string): AnyAdminResource | undefined
  getResources(): AnyAdminResource[]
  registerNavigation(group: NavGroup): void
  isFeatureEnabled(feature: keyof AdminConfig['features']): boolean
}

export function createAdminApp(config: AdminConfig): AdminApp {
  return {
    config,
    registerResource(resource) {
      resourceRegistry.register(resource)
    },
    getResource(name) {
      return resourceRegistry.get(name)
    },
    getResources() {
      return resourceRegistry.getAll()
    },
    registerNavigation(group) {
      navigationRegistry.registerGroup(group)
    },
    isFeatureEnabled(feature) {
      return config.features?.[feature] ?? false
    },
  }
}

const registeredExtensions = new Set<string>()

export function registerExtension(
  extension: AdminExtension,
  config: AdminConfig,
): void {
  if (registeredExtensions.has(extension.name)) return
  registeredExtensions.add(extension.name)

  const app = createAdminApp(config)
  for (const resource of extension.resources ?? []) {
    app.registerResource(resource)
  }
  for (const group of extension.navigation ?? []) {
    app.registerNavigation(group)
  }
  extension.onRegister?.(app)
}
