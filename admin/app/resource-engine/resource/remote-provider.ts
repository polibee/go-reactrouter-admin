import type { ApiResponse } from '~/core/api/contracts'
import type {
  ResourceDataProvider,
  ResourceListQuery,
} from './resource.types'

export interface RemoteResourceService<T, Write = Record<string, unknown>> {
  list: (query?: ResourceListQuery) => Promise<ApiResponse<T[]>>
  find: (id: string) => Promise<ApiResponse<T>>
  create: (values: Write) => Promise<ApiResponse<T>>
  update: (id: string, values: Write) => Promise<ApiResponse<T>>
  delete: (id: string) => Promise<ApiResponse<null>>
}

/** Adapts the generated API service to the backend-agnostic resource engine. */
export function createRemoteResourceProvider<
  T,
  Write = Record<string, unknown>,
>(service: RemoteResourceService<T, Write>): ResourceDataProvider<T> {
  return {
    async list(query) {
      const response = await service.list(query)
      return {
        items: response.data,
        total: response.meta?.total,
      }
    },
    async find(id) {
      const response = await service.find(id)
      return response.data
    },
    async create(values) {
      const response = await service.create(values as Write)
      return response.data
    },
    async update(id, values) {
      const response = await service.update(id, values as Write)
      return response.data
    },
    async delete(id) {
      await service.delete(id)
      return true
    },
  }
}
