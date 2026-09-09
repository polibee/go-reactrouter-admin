import type { AdminResource } from '~/resource-engine/resource'
import { Registry } from './registry'

// biome-ignore lint/suspicious/noExplicitAny: resource rows are heterogeneous across modules
export type AnyAdminResource = AdminResource<any>

export class ResourceRegistry extends Registry<AnyAdminResource> {
  private readonly owners = new Map<string, string>()

  register(resource: AnyAdminResource, owner = 'core'): void {
    super.register(resource)
    this.owners.set(resource.name, owner)
  }

  unregisterOwner(owner: string): void {
    for (const [name, resourceOwner] of this.owners) {
      if (resourceOwner !== owner) continue
      this.unregister(name)
      this.owners.delete(name)
    }
  }

  clear(): void {
    super.clear()
    this.owners.clear()
  }
}

export const resourceRegistry = new ResourceRegistry()
