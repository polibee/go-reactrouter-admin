import { LockKeyhole } from 'lucide-react'
import { i18n } from '~/core/i18n'
import { column } from '~/resource-engine/columns/column-builder'
import {
  defineResource,
  type ResourceListResult,
} from '~/resource-engine/resource'
import {
  SYSTEM_PERMISSION_GROUPS,
  type SystemPermissionDescriptionKey,
  type SystemPermissionGroupTitleKey,
  type SystemPermissionNameKey,
} from '../roles/permissions'

interface PermissionRow {
  id: string
  code: string
  module: string
  groupKey: SystemPermissionGroupTitleKey
  nameKey: SystemPermissionNameKey
  descriptionKey: SystemPermissionDescriptionKey
}

const permissionRows: PermissionRow[] = SYSTEM_PERMISSION_GROUPS.flatMap(
  (group) =>
    group.permissions.map((permission) => ({
      id: permission.code,
      code: permission.code,
      module: permission.module,
      groupKey: group.title,
      nameKey: permission.name,
      descriptionKey: permission.description,
    })),
)

export const permissionApi = {
  list: (): Promise<ResourceListResult<PermissionRow>> =>
    Promise.resolve({ items: permissionRows, total: permissionRows.length }),
}

export const PermissionsResource = defineResource<PermissionRow>({
  name: 'permissions',
  label: i18n.t('resources.permissions.resource.label'),
  pluralLabel: i18n.t('resources.permissions.resource.pluralLabel'),
  icon: LockKeyhole,
  navigation: {
    group: i18n.t('resources.roles.navigationGroup'),
    sort: 30,
  },
  permissions: {
    view: 'roles.view',
  },
  columns: [
    column
      .badge<PermissionRow>('module')
      .variants({
        users: 'info',
        roles: 'success',
        site: 'warning',
        articles: 'error',
        settings: 'default',
      })
      .sortable()
      .build(),
    column
      .text<PermissionRow>('code')
      .labelKey('resources.permissions.resource.codeLabel')
      .sortable()
      .build(),
    column
      .custom<PermissionRow>('name')
      .render((row) => i18n.t(row.nameKey))
      .labelKey('resources.permissions.resource.nameLabel')
      .build(),
    column
      .custom<PermissionRow>('group')
      .render((row) => i18n.t(row.groupKey))
      .labelKey('resources.permissions.resource.groupLabel')
      .build(),
    column
      .custom<PermissionRow>('description')
      .labelKey('common.labels.description')
      .render((row) => (
        <span className="text-muted-foreground text-sm">
          {i18n.t(row.descriptionKey)}
        </span>
      ))
      .build(),
  ],
  data: permissionApi,
})
