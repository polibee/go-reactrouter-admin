import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PluginRegistry } from './plugin-registry.ts'
import type { RuntimePluginDescriptor } from './plugin.types.ts'

const descriptor: RuntimePluginDescriptor = {
  id: 'acme.inventory',
  name: 'inventory',
  displayName: 'Inventory',
  version: '1.0.0',
  apiVersion: '1',
  runtime: 'external',
  state: 'enabled',
  enabled: true,
  trusted: true,
  frontendEntrypoint: '/plugin-assets/acme.inventory/1.0.0/entry.js',
}

test('registers a plugin once by id', () => {
  const registry = new PluginRegistry()

  registry.register(descriptor)
  registry.register({ ...descriptor, displayName: 'Updated Inventory' })

  assert.equal(registry.getAll().length, 1)
  assert.equal(registry.get('acme.inventory')?.displayName, 'Updated Inventory')
})

test('enabled plugins exclude disabled and untrusted runtime entries', () => {
  const registry = new PluginRegistry()

  registry.register(descriptor)
  registry.register({
    ...descriptor,
    id: 'acme.disabled',
    enabled: false,
  })
  registry.register({
    ...descriptor,
    id: 'acme.untrusted',
    trusted: false,
  })

  assert.deepEqual(
    registry.getEnabled().map((item) => item.id),
    ['acme.inventory'],
  )
})

test('clear removes all runtime descriptors', () => {
  const registry = new PluginRegistry()
  registry.register(descriptor)

  registry.clear()

  assert.equal(registry.getAll().length, 0)
})
