import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toRuntimePluginDescriptor } from './plugin-contract.ts'

test('maps the Core plugin list contract to a runtime descriptor', () => {
  const descriptor = toRuntimePluginDescriptor({
    id: '7',
    plugin_id: 'acme.inventory',
    name: 'inventory',
    display_name: 'Inventory',
    state: 'enabled',
    current_version: '1.2.3',
    api_version: '1',
    core_requires: '>=1.0.0',
    frontend_entrypoint: '/plugin-assets/acme.inventory/1.2.3/entry.js',
    trusted: true,
    dependencies: [],
    health_status: 'healthy',
  })

  assert.deepEqual(descriptor, {
    id: 'acme.inventory',
    name: 'inventory',
    displayName: 'Inventory',
    version: '1.2.3',
    apiVersion: '1',
    coreRequires: '>=1.0.0',
    runtime: 'external',
    state: 'enabled',
    enabled: true,
    trusted: true,
    frontendEntrypoint: '/plugin-assets/acme.inventory/1.2.3/entry.js',
  })
})
