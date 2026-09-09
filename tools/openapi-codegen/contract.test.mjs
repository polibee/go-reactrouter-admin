import { collectOperations, generate } from './generate.mjs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const files = ['contracts/core-auth.openapi.json', 'contracts/core-admin.openapi.json', 'contracts/plugin-runtime.openapi.json']

for (const file of files) {
  const document = JSON.parse(await readFile(path.join(root, file), 'utf8'))
  const operations = collectOperations(document, file)
  if (operations.length === 0) throw new Error(`${file}: no operations found`)
  for (const { operation } of operations) {
    if (!operation.operationId) throw new Error(`${file}: operationId is required`)
    if (!operation['x-permission'] && !document['x-permissions']?.[operation.operationId]) throw new Error(`${file}: missing permission metadata for ${operation.operationId}`)
    if (!Object.keys(operation.responses ?? {}).some((status) => /^2\d\d$/.test(status))) throw new Error(`${file}: missing success response for ${operation.operationId}`)
    for (const [status, response] of Object.entries(operation.responses ?? {})) {
      if (/^[45]\d\d$/.test(status) && !response.$ref?.includes('ApiError')) throw new Error(`${file}: ${operation.operationId} ${status} must use ApiError`)
    }
  }
}

await generate()
await generate({ check: true })
console.log('OpenAPI contract and generated-client checks passed.')
