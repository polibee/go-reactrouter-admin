import { listPlugins } from '@generated/core-api'
import type { AdminConfig } from '~/config/admin.config'
import {
  loadPluginFrontend,
  validatePluginCompatibility,
} from '~/core/extensions/plugin-loader'
import { pluginRegistry } from '~/core/extensions/plugin-registry'
import type {
  PluginFrontendModule,
  RuntimePluginDescriptor,
} from '~/core/extensions/plugin.types'
import { clearPluginFrontendApp, createPluginFrontendApp } from './plugin-app'
import {
  toRuntimePluginDescriptor,
  type CorePluginListRecord,
} from './plugin-contract'

export const CURRENT_PLUGIN_API_VERSION = '1'

let runtimeGeneration = 0

export interface PluginRuntimeDependencies {
  fetchPlugins?: () => Promise<CorePluginListRecord[]>
  loadFrontend?: (entrypoint: string) => Promise<PluginFrontendModule>
}

async function fetchCorePlugins(): Promise<CorePluginListRecord[]> {
  const response = await listPlugins({ page: 1, pageSize: 100 })
  return response.data
}

function resetRuntimePlugins(): void {
  runtimeGeneration += 1
  for (const descriptor of pluginRegistry.getAll()) {
    clearPluginFrontendApp(descriptor)
  }
  pluginRegistry.clear()
}

export async function loadEnabledPlugins(
  config: AdminConfig,
  dependencies: PluginRuntimeDependencies = {},
): Promise<RuntimePluginDescriptor[]> {
  resetRuntimePlugins()
  const generation = runtimeGeneration
  const records = await (dependencies.fetchPlugins ?? fetchCorePlugins)()
  if (generation !== runtimeGeneration) return pluginRegistry.getAll()
  const descriptors = records.map(toRuntimePluginDescriptor)
  for (const descriptor of descriptors) pluginRegistry.register(descriptor)

  for (const descriptor of pluginRegistry.getEnabled()) {
    if (generation !== runtimeGeneration) return pluginRegistry.getAll()
    if (!descriptor.frontendEntrypoint) {
      pluginRegistry.markFailed(
        descriptor.id,
        'plugin frontend entrypoint is missing',
      )
      continue
    }
    pluginRegistry.markLoading(descriptor.id)
    try {
      validatePluginCompatibility(descriptor, CURRENT_PLUGIN_API_VERSION)
      const module = await (dependencies.loadFrontend ?? loadPluginFrontend)(
        descriptor.frontendEntrypoint,
      )
      module.register(createPluginFrontendApp(descriptor, config))
      pluginRegistry.markLoaded(descriptor.id)
    } catch (error) {
      clearPluginFrontendApp(descriptor)
      pluginRegistry.markFailed(
        descriptor.id,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  return pluginRegistry.getAll()
}

export function resetEnabledPlugins(): void {
  resetRuntimePlugins()
}
