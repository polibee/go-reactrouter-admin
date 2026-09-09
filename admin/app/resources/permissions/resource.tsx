import { LockKeyhole } from 'lucide-react'
import { i18n } from '~/core/i18n'
import { column } from '~/resource-engine/columns/column-builder'
import { defineResource } from '~/resource-engine/resource'
import { permissionApi } from './api'
import type { PermissionRow } from './types'

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
    view: 'permissions.view',
  },
  columns: [
    column
      .badge<PermissionRow>('module')
      .variants({
        users: 'info',
        roles: 'success',
        site: 'warning',
        posts: 'error',
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
      .render((row) => row.displayName)
      .labelKey('resources.permissions.resource.nameLabel')
      .build(),
    column
      .custom<PermissionRow>('group')
      .render((row) => row.module)
      .labelKey('resources.permissions.resource.groupLabel')
      .build(),
    column
      .custom<PermissionRow>('description')
      .labelKey('common.labels.description')
      .render((row) => (
        <span className="text-muted-foreground text-sm">
          {row.description ?? '—'}
        </span>
      ))
      .build(),
  ],
  data: permissionApi,
})
