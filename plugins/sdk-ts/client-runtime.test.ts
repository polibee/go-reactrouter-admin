import test from 'node:test'
import assert from 'node:assert/strict'
import { pluginRequest, PluginApiError } from './client-runtime.ts'

test('pluginRequest uses Core gateway path and carries browser credentials', async () => {
  let received: RequestInit | undefined
  let receivedUrl = ''
  const response = await pluginRequest<{ message: string }>('example.plugin', 'GET', '/hello', undefined, {
    baseUrl: 'http://core.test',
    fetcher: async (input, init) => {
      receivedUrl = String(input)
      received = init
      return new Response(JSON.stringify({ data: { message: 'hello' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    },
  })

  assert.equal(receivedUrl, 'http://core.test/api/v1/plugins/example.plugin/hello')
  assert.equal(received?.credentials, 'include')
  assert.equal((received?.headers as Record<string, string>)['X-Request-ID']?.length > 0, true)
  assert.deepEqual(response.data, { message: 'hello' })
})

test('pluginRequest normalizes plugin API errors', async () => {
  await assert.rejects(
    pluginRequest('example.plugin', 'GET', '/hello', undefined, {
      fetcher: async () => new Response(JSON.stringify({ error: { code: 'denied', message: 'no access' } }), { status: 403 }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof PluginApiError)
      assert.equal(error.status, 403)
      assert.equal(error.code, 'denied')
      return true
    },
  )
})
