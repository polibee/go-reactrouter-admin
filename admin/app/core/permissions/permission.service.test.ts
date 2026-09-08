import assert from 'node:assert/strict'
import test from 'node:test'
import type { AuthUser } from '~/core/auth/auth.types'
import { hasPermission } from './permission.service.ts'

const user: AuthUser = {
  id: 'user-1',
  name: 'Operator',
  email: 'operator@example.com',
  roles: ['operator'],
  permissions: ['reports.*'],
}

test('permission checks support namespace wildcards', () => {
  assert.equal(hasPermission(user, 'reports.export'), true)
  assert.equal(hasPermission(user, 'reports.saved.filters.delete'), true)
  assert.equal(hasPermission(user, 'users.view'), false)
})

test('missing permission metadata remains visible by default', () => {
  assert.equal(hasPermission(null, undefined), true)
})
