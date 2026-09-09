import type { PermissionDefinition } from './types'

export const SYSTEM_PERMISSION_GROUPS = [
  {
    module: 'users',
    title: 'resources.permissions.groups.users',
    description: 'resources.permissions.groups.usersDescription',
    permissions: [
      {
        code: 'users.view',
        name: 'resources.permissions.items.usersView',
        description: 'resources.permissions.items.usersViewDescription',
        module: 'users',
      },
      {
        code: 'users.create',
        name: 'resources.permissions.items.usersCreate',
        description: 'resources.permissions.items.usersCreateDescription',
        module: 'users',
      },
      {
        code: 'users.update',
        name: 'resources.permissions.items.usersUpdate',
        description: 'resources.permissions.items.usersUpdateDescription',
        module: 'users',
      },
      {
        code: 'users.delete',
        name: 'resources.permissions.items.usersDelete',
        description: 'resources.permissions.items.usersDeleteDescription',
        module: 'users',
      },
    ],
  },
  {
    module: 'roles',
    title: 'resources.permissions.groups.roles',
    description: 'resources.permissions.groups.rolesDescription',
    permissions: [
      {
        code: 'roles.view',
        name: 'resources.permissions.items.rolesView',
        description: 'resources.permissions.items.rolesViewDescription',
        module: 'roles',
      },
      {
        code: 'roles.create',
        name: 'resources.permissions.items.rolesCreate',
        description: 'resources.permissions.items.rolesCreateDescription',
        module: 'roles',
      },
      {
        code: 'roles.update',
        name: 'resources.permissions.items.rolesUpdate',
        description: 'resources.permissions.items.rolesUpdateDescription',
        module: 'roles',
      },
      {
        code: 'roles.delete',
        name: 'resources.permissions.items.rolesDelete',
        description: 'resources.permissions.items.rolesDeleteDescription',
        module: 'roles',
      },
    ],
  },
  {
    module: 'site',
    title: 'resources.permissions.groups.site',
    description: 'resources.permissions.groups.siteDescription',
    permissions: [
      {
        code: 'site.view',
        name: 'resources.permissions.items.siteView',
        description: 'resources.permissions.items.siteViewDescription',
        module: 'site',
      },
      {
        code: 'site.pages',
        name: 'resources.permissions.items.sitePages',
        description: 'resources.permissions.items.sitePagesDescription',
        module: 'site',
      },
      {
        code: 'site.navigation',
        name: 'resources.permissions.items.siteNavigation',
        description: 'resources.permissions.items.siteNavigationDescription',
        module: 'site',
      },
      {
        code: 'site.widgets',
        name: 'resources.permissions.items.siteWidgets',
        description: 'resources.permissions.items.siteWidgetsDescription',
        module: 'site',
      },
      {
        code: 'site.operations',
        name: 'resources.permissions.items.siteOperations',
        description: 'resources.permissions.items.siteOperationsDescription',
        module: 'site',
      },
      {
        code: 'site.links',
        name: 'resources.permissions.items.siteLinks',
        description: 'resources.permissions.items.siteLinksDescription',
        module: 'site',
      },
    ],
  },
  {
    module: 'posts',
    title: 'resources.permissions.groups.posts',
    description: 'resources.permissions.groups.postsDescription',
    permissions: [
      {
        code: 'posts.view',
        name: 'resources.permissions.items.postsView',
        description: 'resources.permissions.items.postsViewDescription',
        module: 'posts',
      },
      {
        code: 'posts.create',
        name: 'resources.permissions.items.postsCreate',
        description: 'resources.permissions.items.postsCreateDescription',
        module: 'posts',
      },
      {
        code: 'posts.update',
        name: 'resources.permissions.items.postsUpdate',
        description: 'resources.permissions.items.postsUpdateDescription',
        module: 'posts',
      },
      {
        code: 'posts.delete',
        name: 'resources.permissions.items.postsDelete',
        description: 'resources.permissions.items.postsDeleteDescription',
        module: 'posts',
      },
    ],
  },
  {
    module: 'settings',
    title: 'resources.permissions.groups.settings',
    description: 'resources.permissions.groups.settingsDescription',
    permissions: [
      {
        code: 'settings.view',
        name: 'resources.permissions.items.settingsView',
        description: 'resources.permissions.items.settingsViewDescription',
        module: 'settings',
      },
      {
        code: 'settings.update',
        name: 'resources.permissions.items.settingsUpdate',
        description: 'resources.permissions.items.settingsUpdateDescription',
        module: 'settings',
      },
    ],
  },
] as const

export type SystemPermissionGroupTitleKey =
  (typeof SYSTEM_PERMISSION_GROUPS)[number]['title']

export type SystemPermissionNameKey =
  (typeof SYSTEM_PERMISSION_GROUPS)[number]['permissions'][number]['name']

export type SystemPermissionDescriptionKey =
  (typeof SYSTEM_PERMISSION_GROUPS)[number]['permissions'][number]['description']

// 展平的所有权限字典列表
export const ALL_PERMISSIONS: PermissionDefinition[] =
  SYSTEM_PERMISSION_GROUPS.flatMap((group) => [...group.permissions])

// 全量权限代码数组
export const ALL_PERMISSION_CODES: string[] = ALL_PERMISSIONS.map((p) => p.code)
