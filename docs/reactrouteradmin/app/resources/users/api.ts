// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import type {
  ResourceListQuery,
  ResourceListResult,
} from '~/resource-engine/resource'
import { userService } from './service'
import type { User, UserFormData } from './types'

export const userApi = {
  async list(query?: ResourceListQuery): Promise<ResourceListResult<User>> {
    const items = await userService.listUsers()
    const search = query?.search?.toLowerCase()
    const filtered = search
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.email.toLowerCase().includes(search),
        )
      : items
    return { items: filtered, total: filtered.length }
  },
  find: (id: string) => userService.getUser(id),
  create: (values: Record<string, unknown>) =>
    userService.createUser(values as UserFormData),
  update: (id: string, values: Record<string, unknown>) =>
    userService.updateUser(id, values),
  delete: (id: string) => userService.deleteUser(id),
}
