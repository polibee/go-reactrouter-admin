import { mediaResources } from './media'
import { permissionsResources } from './permissions'
import { rolesResources } from './roles'
import { siteResources } from './site'
import { usersResources } from './users'

export const resources = {
  users: usersResources,
  roles: rolesResources,
  permissions: permissionsResources,
  media: mediaResources,
  site: siteResources,
}
