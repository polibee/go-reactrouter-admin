import { AlertTriangle, ShieldAlert } from 'lucide-react'
import type React from 'react'
import { useParams } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { AdminPage, AdminPageContent } from '~/components/admin/page'
import { pluginRegistry } from '~/core/extensions/plugin-registry'
import type { PluginPageDefinition } from '~/core/extensions/plugin.types'
import { usePermission } from '~/core/permissions/use-permission'
import { ResourceRouter } from '~/resource-engine/routes'
import { normalizePluginPagePath } from './plugin-registration'

export interface RegisteredPluginPage {
  pluginId: string
  page: PluginPageDefinition
}

export class PluginPageRegistry {
  private readonly pages = new Map<string, RegisteredPluginPage>()

  register(pluginId: string, page: PluginPageDefinition): void {
    this.pages.set(page.path, { pluginId, page })
  }

  get(path: string): RegisteredPluginPage | undefined {
    return this.pages.get(path)
  }

  unregisterOwner(pluginId: string): void {
    for (const [path, registered] of this.pages) {
      if (registered.pluginId === pluginId) this.pages.delete(path)
    }
  }

  clear(): void {
    this.pages.clear()
  }
}

export const pluginPageRegistry = new PluginPageRegistry()

function PluginForbiddenState() {
  return (
    <AdminPage>
      <AdminPageContent>
        <AdminEmpty
          icon={ShieldAlert}
          title="Plugin page unavailable"
          description="You do not have permission to open this plugin page."
        />
      </AdminPageContent>
    </AdminPage>
  )
}

function PluginUnavailableState({
  pluginId,
  message,
}: {
  pluginId: string
  message?: string
}) {
  return (
    <AdminPage>
      <AdminPageContent>
        <AdminEmpty
          icon={AlertTriangle}
          title="Plugin unavailable"
          description={
            message ?? `The frontend for ${pluginId} could not be loaded.`
          }
        />
      </AdminPageContent>
    </AdminPage>
  )
}

function pluginIdFromPath(path: string): string | undefined {
  const match = path.match(/^\/admin\/plugins\/([^/]+)/)
  return match?.[1]
}

export function PluginRouteHost(): React.ReactElement {
  const params = useParams()
  const { hasPermission } = usePermission()
  const path = `/admin/${params['*'] ?? ''}`
  const registered = pluginPageRegistry.get(path)

  if (registered) {
    if (!hasPermission(registered.page.permission))
      return <PluginForbiddenState />
    const Page = registered.page.component
    return <Page />
  }

  const pluginId = pluginIdFromPath(path)
  const plugin = pluginId ? pluginRegistry.get(pluginId) : undefined
  if (plugin?.loadState === 'failed') {
    return (
      <PluginUnavailableState
        pluginId={pluginId ?? 'unknown'}
        message={plugin.loadError}
      />
    )
  }

  return <ResourceRouter />
}

export function registerPluginPage(
  pluginId: string,
  page: PluginPageDefinition,
): void {
  pluginPageRegistry.register(pluginId, {
    ...page,
    path: normalizePluginPagePath(pluginId, page.path),
  })
}
