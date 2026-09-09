import {
  disablePlugin,
  getPlugin,
  enablePlugin,
  installPlugin,
  listPluginOperations,
  listPlugins,
  listPluginVersions,
  uninstallPlugin,
  upgradePlugin,
  type PluginUninstallRequest,
} from '@generated/core-api'
import { createRemoteResourceProvider } from '~/resource-engine/resource'
import type { Plugin } from './types'

export const pluginApi = createRemoteResourceProvider<Plugin, never>({
  list(query) {
    return listPlugins(query)
  },
  find(id) {
    return getPlugin(id)
  },
  create() {
    throw new Error('Plugin installation requires a package upload')
  },
  update() {
    throw new Error('Plugin updates require a package upload')
  },
  delete() {
    throw new Error('Use the plugin lifecycle uninstall action')
  },
})

export function installPluginPackage(file: File) {
  const form = new FormData()
  form.append('package', file)
  return installPlugin(form)
}

export function upgradePluginPackage(pluginId: string, file: File) {
  const form = new FormData()
  form.append('package', file)
  return upgradePlugin(pluginId, form)
}

export const pluginLifecycleApi = {
  enable: enablePlugin,
  disable: disablePlugin,
  uninstall: (
    id: string,
    request: PluginUninstallRequest = { confirm: true },
  ) => uninstallPlugin(id, request),
  versions: listPluginVersions,
  operations: listPluginOperations,
}
