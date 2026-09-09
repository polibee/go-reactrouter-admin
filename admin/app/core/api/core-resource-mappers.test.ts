import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  mapCoreMenu,
  mapCorePermission,
  mapCoreRole,
  mapCoreSetting,
  toMenuWrite,
  toPermissionWrite,
  toRoleWrite,
  toSettingWrite,
} from './core-resource-mappers.ts'

test('maps a Core role without inventing timestamps or permissions', () => {
  assert.deepEqual(
    mapCoreRole({
      id: '7',
      name: 'operator',
      display_name: 'Operator',
      description: null,
      is_system: false,
      permissions: ['users.view'],
    }),
    {
      id: '7',
      name: 'Operator',
      code: 'operator',
      description: undefined,
      permissions: ['users.view'],
      isSystem: false,
      createdAt: '',
      updatedAt: '',
    },
  )
})

test('maps permission, menu, and setting DTOs to stable resource rows', () => {
  assert.deepEqual(
    mapCorePermission({
      id: '2',
      code: 'users.view',
      display_name: 'View users',
      description: 'Read access',
      module_id: 'users',
    }),
    {
      id: '2',
      code: 'users.view',
      module: 'users',
      displayName: 'View users',
      description: 'Read access',
    },
  )
  assert.deepEqual(
    mapCoreMenu({
      id: '3',
      key: 'users',
      label: 'Users',
      path: '/admin/users',
      icon: 'users',
      permission: 'users.view',
      parent_id: null,
      sort: 10,
      is_visible: true,
      meta: null,
    }),
    {
      id: '3',
      key: 'users',
      label: 'Users',
      path: '/admin/users',
      icon: 'users',
      permission: 'users.view',
      parentId: null,
      sort: 10,
      isVisible: true,
      meta: null,
    },
  )
  assert.deepEqual(
    mapCoreSetting({
      id: '4',
      key: 'app.name',
      value: 'Admin',
      type: 'string',
      is_public: false,
    }),
    {
      id: '4',
      key: 'app.name',
      value: 'Admin',
      type: 'string',
      isPublic: false,
    },
  )
})

test('builds Core write payloads without frontend-only fields', () => {
  assert.deepEqual(
    toRoleWrite({ name: 'Operator', code: 'operator', description: 'Ops', permissions: ['1', 'bad'] }, [1]),
    { name: 'operator', display_name: 'Operator', description: 'Ops', permission_ids: [1] },
  )
  assert.deepEqual(
    toPermissionWrite({ code: 'users.view', name: 'View users', description: 'Read' }),
    { code: 'users.view', display_name: 'View users', description: 'Read' },
  )
  assert.deepEqual(
    toMenuWrite({ key: 'users', label: 'Users', path: '/admin/users', parentId: '2', sort: 10, isVisible: true }),
    { key: 'users', label: 'Users', path: '/admin/users', parent_id: 2, sort: 10, is_visible: true },
  )
  assert.deepEqual(
    toSettingWrite({ key: 'app.name', value: 'Admin', type: 'string', isPublic: false }),
    { key: 'app.name', value: 'Admin', type: 'string', is_public: false },
  )
})
