// biome-ignore-all lint/suspicious/useAwait: providers preserve the async transport boundary
import {
  createMenu,
  createPermission,
  createRole,
  createSetting,
  deleteMenu,
  deletePermission,
  deleteRole,
  deleteSetting,
  getMenu,
  getPermission,
  getRole,
  getSetting,
  listMenus,
  listPermissions,
  listRoles,
  listSettings,
  updateMenu,
  updatePermission,
  updateRole,
  updateSetting,
} from '@generated/core-api'
import { createRemoteResourceProvider } from '~/resource-engine/resource'
import type { Role } from '~/resources/roles/types'
import {
  mapCoreMenu,
  mapCorePermission,
  mapCoreRole,
  mapCoreSetting,
  toMenuWrite,
  toPermissionWrite,
  toRoleWrite,
  toSettingWrite,
  type CoreMenuRow,
  type CorePermissionRow,
  type CoreSettingRow,
} from './core-resource-mappers'

async function permissionIds(codes: unknown): Promise<number[]> {
  if (!Array.isArray(codes) || codes.length === 0) return []
  const response = await listPermissions({ page: 1, pageSize: 100 })
  const idByCode = new Map(response.data.map((permission) => [permission.code, Number(permission.id)]))
  return codes
    .filter((code): code is string => typeof code === 'string')
    .map((code) => idByCode.get(code))
    .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
}

export const roleDataProvider = createRemoteResourceProvider<Role, Record<string, unknown>>({
  async list(query) {
    const response = await listRoles(query)
    return { ...response, data: response.data.map(mapCoreRole) }
  },
  async find(id) {
    const response = await getRole(id)
    return { ...response, data: mapCoreRole(response.data) }
  },
  async create(values) {
    const response = await createRole(toRoleWrite(values, await permissionIds(values.permissions)))
    return { ...response, data: mapCoreRole(response.data) }
  },
  async update(id, values) {
    const response = await updateRole(id, toRoleWrite(values, await permissionIds(values.permissions)))
    return { ...response, data: mapCoreRole(response.data) }
  },
  async delete(id) {
    return deleteRole(id)
  },
})

export const permissionDataProvider = createRemoteResourceProvider<CorePermissionRow, Record<string, unknown>>({
  async list(query) {
    const response = await listPermissions(query)
    return { ...response, data: response.data.map(mapCorePermission) }
  },
  async find(id) {
    const response = await getPermission(id)
    return { ...response, data: mapCorePermission(response.data) }
  },
  async create(values) {
    const response = await createPermission(toPermissionWrite(values))
    return { ...response, data: mapCorePermission(response.data) }
  },
  async update(id, values) {
    const response = await updatePermission(id, toPermissionWrite(values))
    return { ...response, data: mapCorePermission(response.data) }
  },
  async delete(id) {
    return deletePermission(id)
  },
})

export const menuDataProvider = createRemoteResourceProvider<CoreMenuRow, Record<string, unknown>>({
  async list(query) {
    const response = await listMenus(query)
    return { ...response, data: response.data.map(mapCoreMenu) }
  },
  async find(id) {
    const response = await getMenu(id)
    return { ...response, data: mapCoreMenu(response.data) }
  },
  async create(values) {
    const response = await createMenu(toMenuWrite(values))
    return { ...response, data: mapCoreMenu(response.data) }
  },
  async update(id, values) {
    const response = await updateMenu(id, toMenuWrite(values))
    return { ...response, data: mapCoreMenu(response.data) }
  },
  async delete(id) {
    return deleteMenu(id)
  },
})

export const settingDataProvider = createRemoteResourceProvider<CoreSettingRow, Record<string, unknown>>({
  async list(query) {
    const response = await listSettings(query)
    return { ...response, data: response.data.map(mapCoreSetting) }
  },
  async find(id) {
    const response = await getSetting(id)
    return { ...response, data: mapCoreSetting(response.data) }
  },
  async create(values) {
    const response = await createSetting(toSettingWrite(values))
    return { ...response, data: mapCoreSetting(response.data) }
  },
  async update(id, values) {
    const response = await updateSetting(id, toSettingWrite(values))
    return { ...response, data: mapCoreSetting(response.data) }
  },
  async delete(id) {
    return deleteSetting(id)
  },
})
