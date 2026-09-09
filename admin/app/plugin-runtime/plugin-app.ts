import type { AdminConfig } from '~/config/admin.config'
import type {
  PluginFrontendApp,
  PluginNavigationItem,
  PluginPageDefinition,
  RuntimePluginDescriptor,
} from '~/core/extensions/plugin.types'
import { navigationRegistry } from '~/core/navigation/navigation-registry'
import { resourceRegistry } from '~/core/registry/resource.registry'
import { namespacePluginResource } from './plugin-registration'
import { pluginPageRegistry, registerPluginPage } from './plugin-routes'

export function createPluginFrontendApp(
  descriptor: RuntimePluginDescriptor,
  config: AdminConfig,
): PluginFrontendApp {
  return {
    config,
    registerResource(resource) {
      resourceRegistry.register(
        namespacePluginResource(descriptor.id, resource),
        descriptor.id,
      )
    },
    registerPage(page: PluginPageDefinition) {
      registerPluginPage(descriptor.id, page)
    },
    registerNavigation(item: PluginNavigationItem) {
      const { group, sort, ...navItem } = item
      navigationRegistry.registerGroup(
        {
          title: group ?? descriptor.displayName,
          sort,
          items: [navItem],
        },
        descriptor.id,
      )
    },
    isFeatureEnabled(feature) {
      return config.features?.[feature] ?? false
    },
  }
}

export function clearPluginFrontendApp(
  descriptor: RuntimePluginDescriptor,
): void {
  resourceRegistry.unregisterOwner(descriptor.id)
  navigationRegistry.unregisterOwner(descriptor.id)
  pluginPageRegistry.unregisterOwner(descriptor.id)
}
