import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  namespacePluginResource,
  normalizePluginPagePath,
} from './plugin-registration.ts'

test('plugin contributions receive stable namespaced resource and page paths', () => {
  const resource = namespacePluginResource('acme.inventory', {
    name: 'orders',
    label: 'Orders',
    routes: { listPath: '/custom/orders' },
  })

  assert.equal(resource.name, 'acme_inventory__orders')
  assert.deepEqual(resource.routes, {
    path: '/admin/acme_inventory__orders',
    listPath: '/admin/acme_inventory__orders',
    createPath: '/admin/acme_inventory__orders/create',
    editPath: '/admin/acme_inventory__orders/:id/edit',
    viewPath: '/admin/acme_inventory__orders/:id',
  })
  assert.equal(
    normalizePluginPagePath('acme.inventory', '/overview'),
    '/admin/plugins/acme.inventory/overview',
  )
})
