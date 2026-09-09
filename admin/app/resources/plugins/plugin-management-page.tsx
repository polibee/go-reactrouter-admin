import { listPlugins } from '@generated/core-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { notify } from '~/components/admin/feedback/notify'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin/page'
import { AdminBadge } from '~/components/admin/primitives/admin-badge'
import { AdminCard } from '~/components/admin/primitives/admin-card'
import { Button } from '~/components/ui/button'
import { useAdmin } from '~/core/admin/admin-context'
import {
  installPluginPackage,
  pluginLifecycleApi,
  upgradePluginPackage,
} from './api'

export function PluginManagementPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pluginRuntime } = useAdmin()
  const installInput = useRef<HTMLInputElement>(null)
  const [installFile, setInstallFile] = useState<File | null>(null)
  const [upgradeFiles, setUpgradeFiles] = useState<Record<string, File | null>>(
    {},
  )
  const [operationError, setOperationError] = useState<string | null>(null)

  const pluginsQuery = useQuery({
    queryKey: ['plugins', 'management'],
    queryFn: () => listPlugins({ page: 1, pageSize: 100 }),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['plugins'] })
    await pluginRuntime.reload()
  }

  const installMutation = useMutation({
    mutationFn: () => {
      if (!installFile) throw new Error('Select a plugin package first')
      return installPluginPackage(installFile)
    },
    onSuccess: async () => {
      setInstallFile(null)
      if (installInput.current) installInput.current.value = ''
      await refresh()
      notify.success('Plugin installed')
    },
    onError: (error) =>
      setOperationError(error instanceof Error ? error.message : String(error)),
  })

  const lifecycleMutation = useMutation({
    mutationFn: (input: {
      id: string
      action: 'enable' | 'disable' | 'uninstall'
    }) => {
      return pluginLifecycleApi[input.action](input.id)
    },
    onSuccess: async () => {
      setOperationError(null)
      await refresh()
      notify.success('Plugin state updated')
    },
    onError: (error) =>
      setOperationError(error instanceof Error ? error.message : String(error)),
  })

  const upgradeMutation = useMutation({
    mutationFn: (pluginId: string) => {
      const file = upgradeFiles[pluginId]
      if (!file) throw new Error('Select an upgrade package first')
      return upgradePluginPackage(pluginId, file)
    },
    onSuccess: async (_result, pluginId) => {
      setUpgradeFiles((current) => ({ ...current, [pluginId]: null }))
      await refresh()
      notify.success('Plugin upgraded')
    },
    onError: (error) =>
      setOperationError(error instanceof Error ? error.message : String(error)),
  })

  if (pluginsQuery.isLoading) {
    return (
      <AdminPage>
        <AdminPageContent>Loading plugins…</AdminPageContent>
      </AdminPage>
    )
  }
  if (pluginsQuery.isError) {
    return (
      <AdminPage>
        <AdminPageContent>
          <AdminEmpty
            icon={AlertTriangle}
            title="Unable to load plugins"
            description={pluginsQuery.error.message}
          />
        </AdminPageContent>
      </AdminPage>
    )
  }

  const plugins = pluginsQuery.data?.data ?? []
  return (
    <AdminPage>
      <AdminPageHeader
        title="Plugin lifecycle"
        description="Install, upgrade, enable, disable, and uninstall verified plugin packages."
        actions={
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={pluginRuntime.isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      <AdminPageContent>
        <AdminCard
          title="Install package"
          description="The backend validates the package before any plugin state is changed."
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={installInput}
              type="file"
              accept=".zip,application/zip"
              onChange={(event) =>
                setInstallFile(event.target.files?.[0] ?? null)
              }
            />
            <Button
              onClick={() => installMutation.mutate()}
              disabled={!installFile || installMutation.isPending}
            >
              <Upload className="h-4 w-4" />
              Install
            </Button>
          </div>
        </AdminCard>
        {operationError ? (
          <AdminCard className="border-destructive/40">
            <p className="text-destructive text-sm">{operationError}</p>
          </AdminCard>
        ) : null}
        {plugins.length === 0 ? (
          <AdminCard>
            <AdminEmpty
              title="No installed plugins"
              description="Install a verified package to manage its lifecycle."
            />
          </AdminCard>
        ) : (
          plugins.map((plugin) => (
            <AdminCard
              key={plugin.plugin_id}
              title={plugin.display_name}
              description={`${plugin.plugin_id} · ${plugin.current_version ?? 'no current version'}`}
              action={
                <AdminBadge
                  status={
                    plugin.state === 'enabled'
                      ? 'success'
                      : plugin.state === 'failed'
                        ? 'error'
                        : 'default'
                  }
                >
                  {plugin.state}
                </AdminBadge>
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                {plugin.state === 'enabled' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      lifecycleMutation.mutate({
                        id: plugin.plugin_id,
                        action: 'disable',
                      })
                    }
                    disabled={lifecycleMutation.isPending}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      lifecycleMutation.mutate({
                        id: plugin.plugin_id,
                        action: 'enable',
                      })
                    }
                    disabled={lifecycleMutation.isPending}
                  >
                    Enable
                  </Button>
                )}
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={(event) =>
                    setUpgradeFiles((current) => ({
                      ...current,
                      [plugin.plugin_id]: event.target.files?.[0] ?? null,
                    }))
                  }
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => upgradeMutation.mutate(plugin.plugin_id)}
                  disabled={
                    !upgradeFiles[plugin.plugin_id] || upgradeMutation.isPending
                  }
                >
                  Upgrade
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Uninstall ${plugin.display_name}? Plugin data is retained.`,
                      )
                    )
                      lifecycleMutation.mutate({
                        id: plugin.plugin_id,
                        action: 'uninstall',
                      })
                  }}
                  disabled={lifecycleMutation.isPending}
                >
                  Uninstall
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/plugins/${plugin.plugin_id}`)}
                >
                  Details
                </Button>
              </div>
            </AdminCard>
          ))
        )}
      </AdminPageContent>
    </AdminPage>
  )
}
