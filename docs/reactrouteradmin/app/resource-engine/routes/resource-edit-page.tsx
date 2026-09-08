import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { AdminLoading } from '~/components/admin/feedback/admin-loading'
import { notify } from '~/components/admin/feedback/notify'
import { AdminForm } from '~/components/admin/form/admin-form'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin/page'
import type { AnyAdminResource } from '~/core/registry/resource.registry'
import { FormFieldRenderer } from '../fields/form-field-renderer'

export function ResourceEditPage({
  resource,
  id,
}: {
  resource: AnyAdminResource
  id?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams()
  const rowId = id ?? params.id
  const listPath = resource.routes?.listPath ?? `/admin/${resource.name}`

  const getQuery = useQuery({
    queryKey: ['resource', resource.name, 'find', rowId],
    queryFn: () => resource.data?.find?.(rowId as string),
    enabled: Boolean(resource.data?.find) && Boolean(rowId),
  })

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      Promise.resolve(resource.data?.update?.(rowId as string, values)),
    onSuccess: () => {
      notify.success(t('common.messages.updateSuccess'))
      navigate(listPath)
    },
    onError: () => notify.error(t('common.messages.operationFailed')),
  })

  return (
    <AdminPage>
      <AdminPageHeader
        title={`${t('common.actions.edit')} · ${resource.label}`}
      />
      <AdminPageContent>
        {getQuery.isLoading ? (
          <AdminLoading />
        ) : !getQuery.data ? (
          <AdminEmpty
            title={t('common.messages.noData')}
            description={t('common.resourceEngine.recordMissingDescription')}
            className="py-16"
          />
        ) : (resource.fields ?? []).length === 0 ? (
          <AdminEmpty
            title={t('common.resourceEngine.noFieldsTitle')}
            description={t('common.resourceEngine.noFieldsDescription')}
            className="py-16"
          />
        ) : (
          <AdminForm<Record<string, unknown>>
            defaultValues={getQuery.data as Record<string, unknown>}
            loading={updateMutation.isPending}
            onSubmit={(values) => updateMutation.mutateAsync(values)}
          >
            <FormFieldRenderer fields={resource.fields ?? []} />
          </AdminForm>
        )}
      </AdminPageContent>
    </AdminPage>
  )
}
