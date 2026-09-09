// biome-ignore-all lint/suspicious/useAwait: generated transport methods keep the async resource boundary
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
  type UserWriteRequest,
} from '~/generated/core-api'
import { createRemoteResourceProvider } from '~/resource-engine/resource'
import type { User } from './types'

function toUser(item: {
  id: string
  name: string
  email: string
  status: string
  is_active: boolean
}): User {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    // The first Core slice does not load role relations in its list DTO yet.
    role: 'user',
    status: item.status === 'active' && item.is_active ? 'active' : 'inactive',
    createdAt: '',
    updatedAt: '',
  }
}

function toWrite(values: Record<string, unknown>): UserWriteRequest {
  const status = values.status === 'active' ? 'active' : 'disabled'
  return {
    name: String(values.name ?? ''),
    email: String(values.email ?? ''),
    status,
    is_active: status === 'active',
    ...(typeof values.password === 'string' && values.password
      ? { password: values.password }
      : {}),
  }
}

export const userApi = createRemoteResourceProvider<User, Record<string, unknown>>({
  async list(query) {
    const response = await listUsers(query)
    return { ...response, data: response.data.map(toUser) }
  },
  async find(id) {
    const response = await getUser(id)
    return { ...response, data: toUser(response.data) }
  },
  async create(values) {
    const response = await createUser(toWrite(values))
    return { ...response, data: toUser(response.data) }
  },
  async update(id, values) {
    const response = await updateUser(id, toWrite(values))
    return { ...response, data: toUser(response.data) }
  },
  async delete(id) {
    return deleteUser(id)
  },
})

export function toUserWriteValues(values: Record<string, unknown>): UserWriteRequest {
  return toWrite(values)
}
