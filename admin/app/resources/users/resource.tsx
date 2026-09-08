import type { ParseKeys } from 'i18next'
import { Users } from 'lucide-react'
import { AdminBadge } from '~/components/admin/primitives/admin-badge'
import { i18n } from '~/core/i18n'
import { action } from '~/resource-engine/actions/action-builder'
import {
  column,
  type BadgeStatus,
} from '~/resource-engine/columns/column-builder'
import { field } from '~/resource-engine/fields/field-builder'
import { defineResource } from '~/resource-engine/resource'
import { userApi } from './api'
import type { User, UserRole, UserStatus } from './types'

const ROLE_LABELS: Record<UserRole, ParseKeys<'translation'>> = {
  super_admin: 'resources.users.roles.superAdmin',
  admin: 'resources.users.roles.admin',
  manager: 'resources.users.roles.manager',
  user: 'resources.users.roles.user',
}

const ROLE_VARIANTS: Record<UserRole, BadgeStatus> = {
  super_admin: 'error',
  admin: 'info',
  manager: 'warning',
  user: 'default',
}

const STATUS_LABELS: Record<UserStatus, ParseKeys<'translation'>> = {
  active: 'resources.users.status.active',
  inactive: 'resources.users.status.inactive',
  suspended: 'resources.users.status.suspended',
}

const STATUS_VARIANTS: Record<UserStatus, BadgeStatus> = {
  active: 'success',
  inactive: 'default',
  suspended: 'error',
}

export const UserResource = defineResource<User>({
  name: 'users',
  label: i18n.t('resources.users.label'),
  pluralLabel: i18n.t('resources.users.pluralLabel'),
  icon: Users,
  navigation: {
    group: i18n.t('resources.users.navGroup'),
    sort: 10,
  },
  permissions: {
    view: 'users.view',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
  },
  routes: {
    path: '/admin/users',
    listPath: '/admin/users',
    createPath: '/admin/users/create',
    editPath: '/admin/users/:id/edit',
    viewPath: '/admin/users/:id',
  },
  columns: [
    column
      .custom<User>('name')
      .labelKey('common.labels.name')
      .sortable()
      .searchable()
      .render((row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="h-8 w-8 rounded-full border object-cover"
            />
          ) : (
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-foreground font-medium">{row.name}</div>
            <div className="text-muted-foreground text-xs">{row.email}</div>
          </div>
        </div>
      ))
      .build(),
    column
      .custom<User>('role')
      .render((row) => (
        <AdminBadge status={ROLE_VARIANTS[row.role]}>
          {i18n.t(ROLE_LABELS[row.role])}
        </AdminBadge>
      ))
      .build(),
    column
      .custom<User>('status')
      .render((row) => (
        <AdminBadge status={STATUS_VARIANTS[row.status]}>
          {i18n.t(STATUS_LABELS[row.status])}
        </AdminBadge>
      ))
      .build(),
    column
      .date<User>('createdAt')
      .labelKey('common.labels.createdAt')
      .sortable()
      .build(),
  ],
  fields: [
    field.text('name').labelKey('common.labels.name').required().build(),
    field.email('email').labelKey('common.labels.email').required().build(),
    field
      .select('role')
      .labelKey('resources.users.table.role')
      .options([
        {
          label: i18n.t('resources.users.roles.superAdmin'),
          value: 'super_admin',
        },
        { label: i18n.t('resources.users.roles.admin'), value: 'admin' },
        { label: i18n.t('resources.users.roles.manager'), value: 'manager' },
        { label: i18n.t('resources.users.roles.user'), value: 'user' },
      ])
      .build(),
    field
      .select('status')
      .labelKey('resources.users.table.status')
      .options([
        { label: i18n.t('resources.users.status.active'), value: 'active' },
        { label: i18n.t('resources.users.status.inactive'), value: 'inactive' },
        {
          label: i18n.t('resources.users.status.suspended'),
          value: 'suspended',
        },
      ])
      .build(),
    field
      .textarea('bio')
      .labelKey('resources.users.form.bioLabel')
      .placeholderKey('resources.users.form.bioPlaceholder')
      .build(),
  ],
  actions: [
    action.create().build(),
    action.edit().build(),
    action.delete().confirm().build(),
    action.bulkDelete().confirm().build(),
  ],
  data: userApi,
})
