import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react'
import { AdminBadge } from '~/components/admin/primitives/admin-badge'
import { i18n } from '~/core/i18n'
import { action } from '~/resource-engine/actions/action-builder'
import { column } from '~/resource-engine/columns/column-builder'
import { field } from '~/resource-engine/fields/field-builder'
import { defineResource } from '~/resource-engine/resource'
import { roleApi } from './api'
import { PermissionMatrix } from './components/permission-matrix'
import type { Role } from './types'

export const RoleResource = defineResource<Role>({
  name: 'roles',
  label: i18n.t('resources.roles.label'),
  pluralLabel: i18n.t('resources.roles.pluralLabel'),
  icon: ShieldCheck,
  navigation: {
    group: i18n.t('resources.roles.navigationGroup'),
    sort: 20,
  },
  permissions: {
    view: 'roles.view',
    create: 'roles.create',
    update: 'roles.update',
    delete: 'roles.delete',
  },
  routes: {
    path: '/admin/roles',
    listPath: '/admin/roles',
    createPath: '/admin/roles/create',
    editPath: '/admin/roles/:id/edit',
    viewPath: '/admin/roles/:id',
  },
  columns: [
    column
      .custom<Role>('name')
      .labelKey('resources.roles.table.name')
      .sortable()
      .searchable()
      .render((row) => (
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            {row.isSystem ? (
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="text-foreground flex items-center gap-1.5 font-medium">
              {row.name}
              {row.isSystem && (
                <span className="rounded-xs bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {i18n.t('resources.roles.table.systemBadge')}
                </span>
              )}
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              {row.code}
            </div>
          </div>
        </div>
      ))
      .build(),
    column
      .text<Role>('description')
      .labelKey('resources.roles.table.description')
      .build(),
    column
      .custom<Role>('permissions')
      .labelKey('resources.roles.table.permissions')
      .render((row) =>
        row.permissions.includes('*') ? (
          <AdminBadge status="warning">
            <KeyRound className="mr-1 h-3 w-3" />
            {i18n.t('resources.roles.table.fullAccess')}
          </AdminBadge>
        ) : (
          <AdminBadge status={row.permissions.length > 0 ? 'info' : 'default'}>
            {i18n.t('resources.roles.table.permissionCount', {
              count: row.permissions.length,
            })}
          </AdminBadge>
        ),
      )
      .build(),
    column.date<Role>('updatedAt').labelKey('common.labels.updatedAt').build(),
  ],
  fields: [
    field
      .text('name')
      .labelKey('resources.roles.fields.name')
      .required()
      .build(),
    field
      .text('code')
      .labelKey('resources.roles.fields.code')
      .required()
      .placeholderKey('resources.roles.fields.codePlaceholder')
      .description(i18n.t('resources.roles.fields.codeDescription'))
      .build(),
    field
      .textarea('description')
      .labelKey('resources.roles.fields.description')
      .placeholderKey('resources.roles.fields.descriptionPlaceholder')
      .build(),
    field
      .custom('permissions')
      .labelKey('resources.roles.fields.permissions')
      .render(PermissionMatrix)
      .build(),
  ],
  actions: [
    action.create().build(),
    action.edit().build(),
    action.delete().confirm().build(),
    action.bulkDelete().confirm().build(),
  ],
  data: roleApi,
})
