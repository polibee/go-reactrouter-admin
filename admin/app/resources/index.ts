import { resourceRegistry } from '~/core/registry/resource.registry'
import { MediaResource } from './media/resource'
import { PermissionsResource } from './permissions/resource'
import { RoleResource } from './roles/resource'
import {
  SiteLinksResource,
  SiteNavResource,
  SiteOperationsResource,
  SitePagesResource,
  SiteWidgetsResource,
} from './site/resource'
import { UserResource } from './users/resource'

let resourcesRegistered = false

export function registerAllResources(): void {
  if (resourcesRegistered) return
  resourcesRegistered = true

  resourceRegistry.register(UserResource)
  resourceRegistry.register(RoleResource)
  resourceRegistry.register(PermissionsResource)
  resourceRegistry.register(MediaResource)
  resourceRegistry.register(SitePagesResource)
  resourceRegistry.register(SiteNavResource)
  resourceRegistry.register(SiteWidgetsResource)
  resourceRegistry.register(SiteOperationsResource)
  resourceRegistry.register(SiteLinksResource)
}
