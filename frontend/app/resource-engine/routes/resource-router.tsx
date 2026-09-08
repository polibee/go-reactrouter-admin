import { FileQuestion, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { AdminEmpty } from '~/components/admin/feedback/admin-empty'
import { AdminPage, AdminPageContent } from '~/components/admin/page'
import { Button } from '~/components/ui/button'
import { usePermission } from '~/core/permissions/use-permission'
import { resourceRegistry } from '~/core/registry/resource.registry'
import { ResourceCreatePage } from './resource-create-page'
import { ResourceDetailPage } from './resource-detail-page'
import { ResourceEditPage } from './resource-edit-page'
import { ResourceListPage } from './resource-list-page'

function ResourceNotFoundState() {
  const { t } = useTranslation()
  return (
    <AdminPage>
      <AdminPageContent>
        <AdminEmpty
          icon={FileQuestion}
          title={t('common.resourceEngine.notFoundTitle')}
          description={t('common.resourceEngine.notFoundDescription')}
          className="py-16"
          action={
            <Button asChild variant="outline">
              <Link to="/admin">
                {t('common.resourceEngine.backToConsole')}
              </Link>
            </Button>
          }
        />
      </AdminPageContent>
    </AdminPage>
  )
}

function ResourceForbiddenState() {
  const { t } = useTranslation()
  return (
    <AdminPage>
      <AdminPageContent>
        <AdminEmpty
          icon={ShieldAlert}
          title={t('common.resourceEngine.forbiddenTitle')}
          description={t('common.resourceEngine.forbiddenDescription')}
          className="py-16"
          action={
            <Button asChild variant="outline">
              <Link to="/admin">
                {t('common.resourceEngine.backToConsole')}
              </Link>
            </Button>
          }
        />
      </AdminPageContent>
    </AdminPage>
  )
}

export function ResourceRouter() {
  const params = useParams()
  const { hasPermission } = usePermission()

  const splat = params['*'] ?? ''
  const [resourceName, ...rest] = splat.split('/')
  const resource = resourceRegistry.get(resourceName)

  if (!resource) return <ResourceNotFoundState />
  if (!hasPermission(resource.permissions?.view)) {
    return <ResourceForbiddenState />
  }

  if (rest.length === 0) {
    return <ResourceListPage resource={resource} />
  }
  if (rest.length === 1 && rest[0] === 'create') {
    return <ResourceCreatePage resource={resource} />
  }
  if (rest.length === 1) {
    return <ResourceDetailPage resource={resource} id={rest[0]} />
  }
  if (rest.length === 2 && rest[1] === 'edit') {
    return <ResourceEditPage resource={resource} id={rest[0]} />
  }
  return <ResourceNotFoundState />
}
