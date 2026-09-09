import type { RuntimePluginDescriptor } from '~/core/extensions/plugin.types'

export interface CorePluginListRecord {
  id?: string
  plugin_id: string
  name: string
  display_name: string
  state: string
  current_version?: string
  api_version?: string
  core_requires?: string
  frontend_entrypoint?: string
  trusted: boolean
  dependencies?: unknown[]
  health_status?: string
}

export function toRuntimePluginDescriptor(
  plugin: CorePluginListRecord,
): RuntimePluginDescriptor {
  return {
    id: plugin.plugin_id,
    name: plugin.name,
    displayName: plugin.display_name,
    version: plugin.current_version ?? '0.0.0',
    apiVersion: plugin.api_version ?? '',
    coreRequires: plugin.core_requires,
    runtime: 'external',
    state: plugin.state as RuntimePluginDescriptor['state'],
    enabled: plugin.state === 'enabled',
    trusted: plugin.trusted,
    frontendEntrypoint: plugin.frontend_entrypoint,
  }
}
