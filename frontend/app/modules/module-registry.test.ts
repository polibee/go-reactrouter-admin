import assert from 'node:assert/strict'
import test from 'node:test'
import type { AdminApp } from '~/core/extensions/extension.types'
import { AdminModuleRegistry } from './module-registry.ts'

const app = {} as AdminApp

test('boots modules in registration order', () => {
  const calls: string[] = []
  const registry = new AdminModuleRegistry([
    { id: 'first', register: () => calls.push('first') },
    { id: 'second', register: () => calls.push('second') },
  ])

  registry.bootstrap(app)

  assert.deepEqual(calls, ['first', 'second'])
})

test('rejects duplicate and empty module ids', () => {
  const registry = new AdminModuleRegistry()
  registry.register({ id: 'billing', register: () => undefined })

  assert.throws(
    () => registry.register({ id: 'billing', register: () => undefined }),
    /already registered/,
  )
  assert.throws(
    () => registry.register({ id: '  ', register: () => undefined }),
    /cannot be empty/,
  )
})
