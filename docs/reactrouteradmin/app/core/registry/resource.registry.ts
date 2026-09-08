import type { AdminResource } from '~/resource-engine/resource'
import { Registry } from './registry'

// biome-ignore lint/suspicious/noExplicitAny: resource rows are heterogeneous across modules
export type AnyAdminResource = AdminResource<any>

export class ResourceRegistry extends Registry<AnyAdminResource> {}

export const resourceRegistry = new ResourceRegistry()
