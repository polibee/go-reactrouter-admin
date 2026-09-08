import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { notify } from '~/components/admin/feedback/notify'
import { AdminForm } from '~/components/admin/form/admin-form'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin/page'
import type { AnyAdminResource } from '~/core/registry/resource.registry'
import { buildFieldDefaultValues } from '../fields/field-builder'
import { FormFieldRenderer } from '../fields/form-field-renderer'

export function ResourceCreatePage({
  resource,
}: {
  resource: AnyAdminResource
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fields = resource.fields ?? []
  const listPath = resource.routes?.listPath ?? `/admin/${resource.name}`

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      Promise.resolve(resource.data?.create?.(values)),
    onSuccess: () => {
      notify.success(t('common.messages.createSuccess'))
      navigate(listPath)
    },
    onError: () => notify.error(t('common.messages.operationFailed')),
  })

  return (
    <AdminPage>
      <AdminPageHeader
        title={`${t('common.actions.create')} · ${resource.label}`}
      />
      <AdminPageContent>
        {fields.length === 0 ? (
          <AdminEmpty
            title={t('common.resourceEngine.noFieldsTitle')}
            description={t('common.resourceEngine.noFieldsDescription')}
            className="py-16"
          />
        ) : (
          <AdminForm<Record<string, unknown>>
            defaultValues={buildFieldDefaultValues(fields)}
            loading={createMutation.isPending}
            onSubmit={(values) => createMutation.mutateAsync(values)}
          >
            <FormFieldRenderer fields={fields} />
          </AdminForm>
        )}
      </AdminPageContent>
    </AdminPage>
  )
}
