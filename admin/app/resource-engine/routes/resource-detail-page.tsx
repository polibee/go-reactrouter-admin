import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { AdminLoading } from '~/components/admin/feedback/admin-loading'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin/page'
import { AdminCard } from '~/components/admin/primitives/admin-card'
import type { AnyAdminResource } from '~/core/registry/resource.registry'

export function ResourceDetailPage({
  resource,
  id,
}: {
  resource: AnyAdminResource
  id?: string
}) {
  const { t } = useTranslation()
  const params = useParams()
  const rowId = id ?? params.id
  const fields = resource.fields ?? []

  const getQuery = useQuery({
    queryKey: ['resource', resource.name, 'find', rowId],
    queryFn: () => resource.data?.find?.(rowId as string),
    enabled: Boolean(resource.data?.find) && Boolean(rowId),
  })

  const row = getQuery.data as Record<string, unknown> | null | undefined

  return (
    <AdminPage>
      <AdminPageHeader
        title={`${resource.label} · ${t('common.resourceEngine.detailTitle')}`}
      />
      <AdminPageContent>
        {getQuery.isLoading ? (
          <AdminLoading />
        ) : !row ? (
          <AdminEmpty
            title={t('common.messages.noData')}
            description={t('common.resourceEngine.recordMissingDescription')}
            className="py-16"
          />
        ) : fields.length === 0 ? (
          <AdminEmpty
            title={t('common.resourceEngine.noFieldsTitle')}
            description={t('common.resourceEngine.noFieldsDescription')}
            className="py-16"
          />
        ) : (
          <AdminCard>
            <dl className="divide-y">
              {fields.map((config) => {
                const label = config.labelKey
                  ? t(config.labelKey)
                  : (config.label ?? config.name)
                const value = row[config.name]
                return (
                  <div
                    key={config.name}
                    className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <dt className="text-muted-foreground w-40 shrink-0 text-sm">
                      {label}
                    </dt>
                    <dd className="text-sm">
                      {value === null || value === undefined || value === ''
                        ? '—'
                        : String(value)}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </AdminCard>
        )}
      </AdminPageContent>
    </AdminPage>
  )
}
