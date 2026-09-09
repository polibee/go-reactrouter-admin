import type { Role } from '~/resources/roles/types'

export interface CoreRoleDto {
  id: string
  name: string
  display_name: string
  description?: string | null
  is_system: boolean
  permissions?: string[]
}

export interface CorePermissionDto {
  id: string
  code: string
  display_name: string
  description?: string | null
  module_id?: string | null
}

export interface CoreMenuDto {
  id: string
  key: string
  label: string
  path?: string | null
  icon?: string | null
  permission?: string | null
  parent_id?: string | null
  sort: number
  is_visible: boolean
  meta?: string | null
}

export interface CoreSettingDto {
  id: string
  key: string
  value: string
  type: string
  is_public: boolean
}

export interface CorePermissionRow {
  id: string
  code: string
  module: string
  displayName: string
  description?: string
}

export interface CoreMenuRow {
  id: string
  key: string
  label: string
  path?: string
  icon?: string
  permission?: string
  parentId: string | null
  sort: number
  isVisible: boolean
  meta: string | null
}

export interface CoreSettingRow {
  id: string
  key: string
  value: string
  type: string
  isPublic: boolean
}

export function mapCoreRole(dto: CoreRoleDto): Role {
  return {
    id: dto.id,
    name: dto.display_name,
    code: dto.name,
    description: dto.description ?? undefined,
    permissions: dto.permissions ?? [],
    isSystem: dto.is_system,
    createdAt: '',
    updatedAt: '',
  }
}

export function mapCorePermission(dto: CorePermissionDto): CorePermissionRow {
  return {
    id: dto.id,
    code: dto.code,
    module: dto.module_id ?? dto.code.split('.')[0] ?? 'core',
    displayName: dto.display_name,
    ...(dto.description ? { description: dto.description } : {}),
  }
}

export function mapCoreMenu(dto: CoreMenuDto): CoreMenuRow {
  return {
    id: dto.id,
    key: dto.key,
    label: dto.label,
    ...(dto.path ? { path: dto.path } : {}),
    ...(dto.icon ? { icon: dto.icon } : {}),
    ...(dto.permission ? { permission: dto.permission } : {}),
    parentId: dto.parent_id ?? null,
    sort: dto.sort,
    isVisible: dto.is_visible,
    meta: dto.meta ?? null,
  }
}

export function mapCoreSetting(dto: CoreSettingDto): CoreSettingRow {
  return {
    id: dto.id,
    key: dto.key,
    value: dto.value,
    type: dto.type,
    isPublic: dto.is_public,
  }
}

function optionalString(values: Record<string, unknown>, key: string): string | undefined {
  const value = values[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function toRoleWrite(values: Record<string, unknown>, permissionIds: number[]) {
  return {
    name: optionalString(values, 'code') ?? '',
    display_name: optionalString(values, 'name') ?? '',
    ...(optionalString(values, 'description') ? { description: optionalString(values, 'description') } : {}),
    ...(permissionIds.length > 0 ? { permission_ids: permissionIds } : {}),
  }
}

export function toPermissionWrite(values: Record<string, unknown>) {
  return {
    code: optionalString(values, 'code') ?? '',
    display_name: optionalString(values, 'name') ?? optionalString(values, 'displayName') ?? '',
    ...(optionalString(values, 'description') ? { description: optionalString(values, 'description') } : {}),
  }
}

export function toMenuWrite(values: Record<string, unknown>) {
  const parentId = optionalString(values, 'parentId')
  return {
    key: optionalString(values, 'key') ?? '',
    label: optionalString(values, 'label') ?? '',
    ...(optionalString(values, 'path') ? { path: optionalString(values, 'path') } : {}),
    ...(optionalString(values, 'icon') ? { icon: optionalString(values, 'icon') } : {}),
    ...(optionalString(values, 'permission') ? { permission: optionalString(values, 'permission') } : {}),
    ...(parentId ? { parent_id: Number(parentId) } : {}),
    ...(typeof values.sort === 'number' ? { sort: values.sort } : {}),
    ...(typeof values.isVisible === 'boolean' ? { is_visible: values.isVisible } : {}),
    ...(optionalString(values, 'meta') ? { meta: optionalString(values, 'meta') } : {}),
  }
}

export function toSettingWrite(values: Record<string, unknown>) {
  return {
    key: optionalString(values, 'key') ?? '',
    value: String(values.value ?? ''),
    ...(optionalString(values, 'type') ? { type: optionalString(values, 'type') } : {}),
    ...(typeof values.isPublic === 'boolean' ? { is_public: values.isPublic } : {}),
  }
}
