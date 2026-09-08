import type { RouteObject } from 'react-router'
import type { AnyAdminResource } from '~/core/registry/resource.registry'
import { ResourceCreatePage } from './resource-create-page'
import { ResourceDetailPage } from './resource-detail-page'
import { ResourceEditPage } from './resource-edit-page'
import { ResourceListPage } from './resource-list-page'

export function createResourceRoutes(
  resources: AnyAdminResource[],
): RouteObject[] {
  const routes: RouteObject[] = []
  for (const resource of resources) {
    const config = resource.routes ?? {}
    const base = config.path ?? `/admin/${resource.name}`
    routes.push(
      {
        path: config.listPath ?? base,
        element: <ResourceListPage resource={resource} />,
      },
      {
        path: config.createPath ?? `${base}/create`,
        element: <ResourceCreatePage resource={resource} />,
      },
      {
        path: config.editPath ?? `${base}/:id/edit`,
        element: <ResourceEditPage resource={resource} />,
      },
      {
        path: config.viewPath ?? `${base}/:id`,
        element: <ResourceDetailPage resource={resource} />,
      },
    )
  }
  return routes
}
