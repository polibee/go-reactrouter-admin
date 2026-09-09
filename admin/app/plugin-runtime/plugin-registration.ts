export interface PluginResourceRoutes {
  path?: string
  listPath?: string
  createPath?: string
  editPath?: string
  viewPath?: string
}

export interface PluginResourceLike {
  name: string
  routes?: PluginResourceRoutes
}

export function pluginResourceName(
  pluginId: string,
  resourceName: string,
): string {
  return `${pluginId.replace(/[^a-z0-9]+/gi, '_')}__${resourceName}`
}

export function namespacePluginResource<T extends PluginResourceLike>(
  pluginId: string,
  resource: T,
): T {
  const name = pluginResourceName(pluginId, resource.name)
  const base = `/admin/${name}`
  return {
    ...resource,
    name,
    routes: {
      path: base,
      listPath: base,
      createPath: `${base}/create`,
      editPath: `${base}/:id/edit`,
      viewPath: `${base}/:id`,
    },
  }
}

export function normalizePluginPagePath(
  pluginId: string,
  path: string,
): string {
  const base = `/admin/plugins/${pluginId}`
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === base || normalized.startsWith(`${base}/`))
    return normalized
  return `${base}${normalized}`
}
