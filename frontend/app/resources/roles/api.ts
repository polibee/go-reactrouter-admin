// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import type {
  ResourceListQuery,
  ResourceListResult,
} from '~/resource-engine/resource'
import { roleService } from './service'
import type { Role, RoleFormValues } from './types'

export const roleApi = {
  async list(query?: ResourceListQuery): Promise<ResourceListResult<Role>> {
    const items = await roleService.getRoles()
    const search = query?.search?.toLowerCase()
    const filtered = search
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.code.toLowerCase().includes(search),
        )
      : items
    return { items: filtered, total: filtered.length }
  },
  find: (id: string) => roleService.getRoleById(id),
  create: (values: Record<string, unknown>) =>
    roleService.createRole(values as RoleFormValues),
  update: (id: string, values: Record<string, unknown>) =>
    roleService.updateRole(id, values as RoleFormValues),
  delete: (id: string) => roleService.deleteRole(id),
}
