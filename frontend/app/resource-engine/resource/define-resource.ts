import type { AdminResource, ResourceConfig } from './resource.types'

export function defineResource<T = unknown>(
  config: ResourceConfig<T>,
): AdminResource<T> {
  const defaultPath = `/admin/${config.name}`
  return {
    ...config,
    routes: {
      path: defaultPath,
      listPath: defaultPath,
      createPath: `${defaultPath}/create`,
      editPath: `${defaultPath}/:id/edit`,
      viewPath: `${defaultPath}/:id`,
      ...config.routes,
    },
    ...(config.navigation
      ? { navigation: { sort: 10, ...config.navigation } }
      : {}),
  }
}
