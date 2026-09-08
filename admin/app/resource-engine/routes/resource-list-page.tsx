import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { notify } from '~/components/admin/feedback/notify'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin/page'
import { AdminTable } from '~/components/admin/table/data-table'
import type { AnyAdminResource } from '~/core/registry/resource.registry'
import type { ResourceActionConfig } from '../actions/action-builder'
import { ResourceActions } from '../actions/action-renderer'

function getRowId(row: unknown): string | null {
  const id = (row as { id?: unknown } | null | undefined)?.id
  return typeof id === 'string' || typeof id === 'number' ? String(id) : null
}

export function ResourceListPage({ resource }: { resource: AnyAdminResource }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const basePath = resource.routes?.listPath ?? `/admin/${resource.name}`
  const actions = resource.actions ?? []
  const hasRowActions = actions.some((item) => item.scope === 'row')
  const hasBulkActions = actions.some((item) => item.scope === 'bulk')

  const listQuery = useQuery({
    queryKey: ['resource', resource.name, 'list'],
    queryFn: () => resource.data?.list?.(),
    enabled: Boolean(resource.data?.list),
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await resource.data?.delete?.(id)
    },
    onSuccess: () => {
      notify.success(t('common.messages.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['resource', resource.name] })
    },
    onError: () => notify.error(t('common.messages.operationFailed')),
  })

  const handlePageAction = (action: ResourceActionConfig) => {
    if (action.kind === 'create') {
      navigate(resource.routes?.createPath ?? `${basePath}/create`)
    }
  }

  const handleRowAction = (action: ResourceActionConfig, row?: unknown) => {
    const id = getRowId(row)
    if (!id) return
    if (action.kind === 'delete') {
      removeMutation.mutate(id)
    } else if (action.kind === 'edit') {
      navigate(
        resource.routes?.editPath
          ? resource.routes.editPath.replace(':id', id)
          : `${basePath}/${id}/edit`,
      )
    } else if (action.kind === 'view') {
      navigate(
        resource.routes?.viewPath
          ? resource.routes.viewPath.replace(':id', id)
          : `${basePath}/${id}`,
      )
    }
  }

  if (!resource.data?.list) {
    return (
      <AdminPage>
        <AdminPageHeader title={resource.label} />
        <AdminPageContent>
          <AdminEmpty
            title={t('common.resourceEngine.noDataSourceTitle')}
            description={t('common.resourceEngine.noDataSourceDescription')}
            className="py-16"
          />
        </AdminPageContent>
      </AdminPage>
    )
  }

  const baseColumns = resource.columns ?? []
  const searchColumn = baseColumns.find(
    (item) => item.meta?.searchable === true && typeof item.id === 'string',
  )
  const searchKey =
    typeof searchColumn?.id === 'string' ? searchColumn.id : undefined
  if (baseColumns.length === 0) {
    return (
      <AdminPage>
        <AdminPageHeader title={resource.label} />
        <AdminPageContent>
          <AdminEmpty
            title={t('common.resourceEngine.noColumnsTitle')}
            description={t('common.resourceEngine.noColumnsDescription')}
            className="py-16"
          />
        </AdminPageContent>
      </AdminPage>
    )
  }

  // biome-ignore lint/suspicious/noExplicitAny: resource rows are heterogeneous across modules
  const columns: ColumnDef<any, unknown>[] = hasRowActions
    ? [
        ...baseColumns,
        {
          id: 'actions',
          header: () => t('common.labels.actions'),
          enableSorting: false,
          cell: ({ row }) => (
            <ResourceActions
              actions={actions}
              scope="row"
              row={row.original}
              onAction={handleRowAction}
            />
          ),
        } satisfies ColumnDef<any, unknown>,
      ]
    : baseColumns

  return (
    <AdminPage>
      <AdminPageHeader
        title={resource.label}
        actions={
          actions.length > 0 ? (
            <ResourceActions
              actions={actions}
              scope="page"
              onAction={handlePageAction}
            />
          ) : undefined
        }
      />
      <AdminPageContent>
        <AdminTable
          columns={columns}
          data={listQuery.data?.items ?? []}
          loading={listQuery.isLoading}
          searchKey={searchKey}
          enableRowSelection={hasBulkActions}
          onBulkDelete={
            hasBulkActions
              ? (rows) => {
                  for (const row of rows) {
                    const id = getRowId(row)
                    if (id) removeMutation.mutate(id)
                  }
                }
              : undefined
          }
        />
      </AdminPageContent>
    </AdminPage>
  )
}
