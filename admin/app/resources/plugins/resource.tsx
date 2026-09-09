import { PackageCheck } from 'lucide-react'
import { AdminBadge } from '~/components/admin/primitives/admin-badge'
import { action } from '~/resource-engine/actions/action-builder'
import { column } from '~/resource-engine/columns/column-builder'
import { defineResource } from '~/resource-engine/resource'
import { pluginApi } from './api'
import { PluginManagementPage } from './plugin-management-page'
import type { Plugin } from './types'

function stateStatus(state: string) {
  if (state === 'enabled') return 'success' as const
  if (state === 'failed') return 'error' as const
  if (state === 'disabled') return 'warning' as const
  return 'default' as const
}

export const PluginResource = defineResource<Plugin>({
  name: 'plugins',
  label: 'Plugins',
  pluralLabel: 'Plugins',
  icon: PackageCheck,
  navigation: { group: 'System', sort: 90 },
  permissions: {
    view: 'plugins.view',
    create: 'plugins.manage',
    update: 'plugins.manage',
    delete: 'plugins.manage',
  },
  routes: {
    path: '/admin/plugins',
    listPath: '/admin/plugins',
    viewPath: '/admin/plugins/:id',
  },
  columns: [
    column
      .custom<Plugin>('display_name')
      .label('Plugin')
      .render((row) => (
        <div>
          <div className="font-medium">{row.display_name}</div>
          <div className="text-muted-foreground font-mono text-xs">
            {row.plugin_id}
          </div>
        </div>
      ))
      .build(),
    column.text<Plugin>('current_version').label('Version').build(),
    column
      .custom<Plugin>('state')
      .label('State')
      .render((row) => (
        <AdminBadge status={stateStatus(row.state)}>{row.state}</AdminBadge>
      ))
      .build(),
    column.text<Plugin>('health_status').label('Health').build(),
  ],
  actions: [
    action
      .custom('custom', 'page')
      .id('manage-plugin-lifecycle')
      .label('Manage lifecycle')
      .permission('plugins.manage')
      .to(() => '/admin/plugins/manage')
      .build(),
  ],
  customPages: [{ path: 'manage', component: PluginManagementPage }],
  data: pluginApi,
})
