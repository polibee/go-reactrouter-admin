import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validatePluginCompatibility } from './plugin-loader.ts'
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

test('disable removes a plugin from enabled descriptors and records its state', () => {
  const registry = new PluginRegistry()
  registry.register(descriptor)

  registry.disable('acme.inventory')

  assert.equal(registry.get('acme.inventory')?.enabled, false)
  assert.equal(registry.get('acme.inventory')?.state, 'disabled')
  assert.deepEqual(registry.getEnabled(), [])
})

test('failed frontend loading is visible without making the plugin routable', () => {
  const registry = new PluginRegistry()
  registry.register(descriptor)

  registry.markFailed('acme.inventory', 'bundle unavailable')

  assert.equal(registry.get('acme.inventory')?.loadError, 'bundle unavailable')
  assert.deepEqual(registry.getEnabled(), [])
})

test('trusted frontend loading validates the plugin API version before import', () => {
  assert.doesNotThrow(() => validatePluginCompatibility(descriptor, '1'))
  assert.throws(
    () => validatePluginCompatibility({ ...descriptor, apiVersion: '2' }, '1'),
    /unsupported plugin api version/,
  )
  assert.throws(
    () => validatePluginCompatibility({ ...descriptor, trusted: false }, '1'),
    /untrusted plugin frontend/,
  )
})
