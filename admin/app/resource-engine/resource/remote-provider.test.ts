// biome-ignore-all lint/suspicious/useAwait: fake services intentionally match the async transport boundary
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ApiResponse } from '~/core/api/contracts'
import { createRemoteResourceProvider } from './remote-provider.ts'

interface Item {
  id: string
  name: string
}

function response<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return { data, meta }
}

test('remote provider forwards list query and maps pagination metadata', async () => {
  let received: unknown
  const provider = createRemoteResourceProvider<Item>({
    list: async (query) => {
      received = query
      return response([{ id: '1', name: 'One' }], { page: 2, pageSize: 10, total: 21 })
    },
    find: async () => response({ id: '1', name: 'One' }),
    create: async (values) => response({ id: '2', name: String(values.name) }),
    update: async (id, values) => response({ id, name: String(values.name) }),
    delete: async () => response(null),
  })

  const result = await provider.list?.({ page: 2, pageSize: 10, search: 'one' })
  assert.deepEqual(received, { page: 2, pageSize: 10, search: 'one' })
  assert.deepEqual(result, { items: [{ id: '1', name: 'One' }], total: 21 })
})

test('remote provider delegates find, mutations, and delete', async () => {
  const calls: string[] = []
  const provider = createRemoteResourceProvider<Item>({
    list: async () => response([]),
    find: async (id) => {
      calls.push(`find:${id}`)
      return response({ id, name: 'Found' })
    },
    create: async (values) => {
      calls.push(`create:${String(values.name)}`)
      return response({ id: '2', name: String(values.name) })
    },
    update: async (id, values) => {
      calls.push(`update:${id}`)
      return response({ id, name: String(values.name) })
    },
    delete: async (id) => {
      calls.push(`delete:${id}`)
      return response(null)
    },
  })

  assert.deepEqual(await provider.find?.('1'), { id: '1', name: 'Found' })
  assert.deepEqual(await provider.create?.({ name: 'Created' }), { id: '2', name: 'Created' })
  assert.deepEqual(await provider.update?.('2', { name: 'Updated' }), { id: '2', name: 'Updated' })
  assert.equal(await provider.delete?.('2'), true)
  assert.deepEqual(calls, ['find:1', 'create:Created', 'update:2', 'delete:2'])
})

test('remote provider preserves normalized API errors', async () => {
  const error = new Error('validation failed')
  const provider = createRemoteResourceProvider<Item>({
    list: async () => response([]),
    find: async () => response({ id: '1', name: 'One' }),
    create: async () => { throw error },
    update: async () => response({ id: '1', name: 'One' }),
    delete: async () => response(null),
  })

  const create = provider.create
  if (!create) throw new Error('create provider method is required for this test')
  await assert.rejects(() => create({ name: 'bad' }), error)
})
