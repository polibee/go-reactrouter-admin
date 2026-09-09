import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const contractFiles = ['contracts/core-auth.openapi.json', 'contracts/core-admin.openapi.json']
const pluginContracts = [{ file: 'plugins/sdk-go/example-plugin/openapi.json', output: 'plugins/sdk-ts/example-plugin/client.ts' }]
const methods = new Set(['get', 'post', 'put', 'patch', 'delete'])

async function loadContract(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function resolveRef(document, value) {
  if (!value?.$ref) return value
  const [, pointer] = value.$ref.split('#')
  if (!pointer) throw new Error(`External references are not supported: ${value.$ref}`)
  return pointer.slice(1).split('/').map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~')).reduce((current, key) => current?.[key], document)
}

function resolveDeep(document, value) {
  let current = value
  const seen = new Set()
  while (current?.$ref) {
    if (seen.has(current.$ref)) throw new Error(`Circular reference: ${current.$ref}`)
    seen.add(current.$ref)
    current = resolveRef(document, current)
  }
  return current
}

export function collectOperations(document, filename = 'contract') {
  const operations = []
  for (const [route, rawPathItem] of Object.entries(document.paths ?? {})) {
    const pathItem = resolveDeep(document, rawPathItem)
    for (const [method, rawOperation] of Object.entries(pathItem ?? {})) {
      if (!methods.has(method)) continue
      const operation = resolveDeep(document, rawOperation)
      if (!operation) throw new Error(`${filename} ${method.toUpperCase()} ${route} is empty`)
      operations.push({ document, filename, route, method, operation })
    }
  }
  return operations
}

function permissionFor(document, operation) {
  return operation['x-permission'] ?? document['x-permissions']?.[operation.operationId]
}

function validateOperations(operations) {
  const errors = []
  for (const { document, filename, route, method, operation } of operations) {
    const label = `${filename} ${method.toUpperCase()} ${route}`
    if (!operation.operationId) errors.push(`${label}: missing operationId`)
    if (!permissionFor(document, operation)) errors.push(`${label}: missing permission metadata`)
    const responses = Object.entries(operation.responses ?? {})
    if (!responses.some(([status]) => /^2\d\d$/.test(status))) errors.push(`${label}: missing successful response`)
    for (const [status, rawResponse] of responses) {
      const response = resolveDeep(document, rawResponse)
      if (/^[45]\d\d$/.test(status)) {
        const schema = response?.content?.['application/json']?.schema
        if (!schema || (!schema.$ref?.includes('ApiError') && !resolveDeep(document, schema)?.properties?.error)) {
          errors.push(`${label}: ${status} response is missing an error schema`)
        }
      }
    }
  }
  if (errors.length) throw new Error(`OpenAPI contract validation failed:\n${errors.join('\n')}`)
}

function schemaName(ref) {
  return ref?.$ref?.split('/').at(-1)
}

function schemaToTs(document, rawSchema) {
  const schema = resolveDeep(document, rawSchema) ?? {}
  const refName = schemaName(rawSchema)
  if (refName) return refName
  if (schema.allOf) return schema.allOf.map((part) => schemaToTs(document, part)).join(' & ')
  if (schema.oneOf) return schema.oneOf.map((part) => schemaToTs(document, part)).join(' | ')
  if (Array.isArray(schema.type)) return schema.type.map((type) => schemaToTs(document, { ...schema, type })).join(' | ')
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ')
  if (schema.type === 'array' || schema.items) return `Array<${schemaToTs(document, schema.items ?? {})}>`
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    if (schema.additionalProperties) return 'Record<string, unknown>'
    const required = new Set(schema.required ?? [])
    const properties = Object.entries(schema.properties ?? {}).map(([name, property]) => `${name}${required.has(name) ? '' : '?'}: ${schemaToTs(document, property)}`)
    return properties.length ? `{ ${properties.join('; ')} }` : 'Record<string, unknown>'
  }
  if (schema.type === 'integer' || schema.type === 'number') return 'number'
  if (schema.type === 'boolean') return 'boolean'
  if (schema.type === 'string') return 'string'
  if (schema.type === 'null') return 'null'
  return 'unknown'
}

function schemaInterface(document, name, schema) {
  const resolved = resolveDeep(document, schema)
  if (resolved?.allOf || (resolved?.type !== 'object' && !resolved?.properties)) return `export type ${name} = ${schemaToTs(document, schema)}\n`
  const required = new Set(resolved.required ?? [])
  const properties = Object.entries(resolved.properties ?? {}).map(([property, value]) => `  ${property}${required.has(property) ? '' : '?'}: ${schemaToTs(document, value)}`)
  return `export interface ${name} {\n${properties.join('\n')}\n}\n`
}

function collectSchemaRefs(document, rawSchema, usedSchemas, visited = new Set()) {
  if (!rawSchema) return
  const refName = schemaName(rawSchema)
  if (refName) {
    if (visited.has(refName)) return
    visited.add(refName)
    usedSchemas.add(refName)
    collectSchemaRefs(document, document.components?.schemas?.[refName], usedSchemas, visited)
    return
  }
  const schema = resolveDeep(document, rawSchema) ?? {}
  for (const property of Object.values(schema.properties ?? {})) collectSchemaRefs(document, property, usedSchemas, visited)
  collectSchemaRefs(document, schema.items, usedSchemas, visited)
  for (const part of [...(schema.allOf ?? []), ...(schema.oneOf ?? []), ...(schema.anyOf ?? [])]) collectSchemaRefs(document, part, usedSchemas, visited)
}

function requestBodyType(document, operation) {
  const requestBody = resolveDeep(document, operation.requestBody)
  return schemaName(requestBody?.content?.['application/json']?.schema) ?? 'Record<string, unknown>'
}

function responseType(operation) {
  if (operation.operationId?.startsWith('list')) {
    const resource = operation.operationId.replace(/^list/, '').replace(/s$/, '')
    return `${resource}ListItem[]`
  }
  if (operation.operationId === 'login' || operation.operationId === 'getCurrentUser') return 'AuthUser'
  if (operation.operationId === 'logout' || operation.operationId?.startsWith('delete')) return 'null'
  if (operation.operationId?.startsWith('validate')) return 'PluginValidationResult'
  const resource = operation.operationId?.replace(/^(create|update|get)/, '')
  return resource ? `${resource}ListItem` : 'unknown'
}

function pluginResponseType(document, operation) {
  const success = Object.entries(operation.responses ?? {}).find(([status]) => /^2\d\d$/.test(status))?.[1]
  const response = resolveDeep(document, success)
  const schema = resolveDeep(document, response?.content?.['application/json']?.schema)
  return schema?.properties?.data ? schemaToTs(document, schema.properties.data) : schemaToTs(document, schema)
}

function buildPluginClient(document, filename) {
  const operations = collectOperations(document, filename)
  validateOperations(operations)
  const pluginId = document['x-plugin-id']
  if (!pluginId) throw new Error(`${filename}: missing x-plugin-id`)
  const usedSchemas = new Set()
  for (const { operation } of operations) {
    const result = pluginResponseType(document, operation)
    const success = Object.entries(operation.responses ?? {}).find(([status]) => /^2\d\d$/.test(status))?.[1]
    const response = resolveDeep(document, success)
    const schema = resolveDeep(document, response?.content?.['application/json']?.schema)
    collectSchemaRefs(document, schema?.properties?.data ?? schema, usedSchemas)
  }
  const blocks = [
    `/* eslint-disable */\n// Generated by tools/openapi-codegen/generate.mjs. Do not edit by hand.\n`,
    `import { pluginRequest, type PluginApiResponse, type PluginRequestOptions } from '../client-runtime'\n\n`,
  ]
  for (const name of [...usedSchemas].sort()) {
    if (document.components?.schemas?.[name]) blocks.push(schemaInterface(document, name, document.components.schemas[name]), '\n')
  }
  for (const { route, method, operation } of operations) {
    const params = [...route.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])
    const args = params.map((parameter) => `${parameter}: string`)
    if (operation.requestBody) args.push(`body: ${requestBodyType(document, operation)}`)
    args.push('options?: PluginRequestOptions')
    let url = route
    for (const parameter of params) url = url.replace(`{${parameter}}`, `\${${parameter}}`)
    const body = operation.requestBody ? 'body' : 'undefined'
    const result = pluginResponseType(document, operation)
    blocks.push(`export function ${operation.operationId}(${args.join(', ')}): Promise<PluginApiResponse<${result}>> {\n  return pluginRequest<${result}>('${pluginId}', '${method.toUpperCase()}', \`${url}\`, ${body}, options)\n}\n\n`)
  }
  return `${blocks.join('').trimEnd()}\n`
}

function clientFunction({ route, method, operation }, document) {
  const params = [...route.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])
  const isList = operation.operationId.startsWith('list')
  const args = params.map((parameter) => `${parameter}: string`)
  if (isList) args.push('params?: CoreListQuery')
  else if (operation.requestBody) args.push(`body: ${requestBodyType(document, operation)}`)
  args.push('options?: RequestOptions')
  let url = route
  for (const parameter of params) url = url.replace(`{${parameter}}`, `\${${parameter}}`)
  const fullPath = `${document.servers?.[0]?.url ?? ''}${url}`
  const body = operation.requestBody ? 'body' : 'undefined'
  const options = isList ? ', mergeOptions(options, params)' : ', options'
  const result = responseType(operation)
  return `export function ${operation.operationId}(${args.join(', ')}): Promise<ApiResponse<${result}>> {\n  return request<${result}>('${method.toUpperCase()}', \`${fullPath}\`, ${body}${options})\n}\n`
}

function buildClient(documents, operations) {
  const usedSchemas = new Set(['AuthUser'])
  for (const { document, operation } of operations) {
    const bodySchema = schemaName(resolveDeep(document, operation.requestBody)?.content?.['application/json']?.schema)
    if (bodySchema) usedSchemas.add(bodySchema)
    const result = responseType(operation)
    if (result.endsWith('[]')) usedSchemas.add(result.slice(0, -2))
    else if (result !== 'null' && result !== 'unknown') usedSchemas.add(result)
  }
  const blocks = [
    `/* eslint-disable */\n// Generated by tools/openapi-codegen/generate.mjs. Do not edit by hand.\n`,
    `import type { ApiResponse } from '~/core/api/contracts'\nimport { request, type RequestOptions } from '~/core/api/request'\n\n`,
    `export interface CoreListQuery { page?: number; pageSize?: number; search?: string; sort?: string; filter?: Record<string, string> }\n\n`,
    `function mergeOptions(options: RequestOptions | undefined, params: CoreListQuery | undefined): RequestOptions | undefined {\n  if (!params) return options\n  const { filter, ...query } = params\n  const filterQuery = Object.fromEntries(Object.entries(filter ?? {}).map(([key, value]) => [\`filter[\${key}]\`, value]))\n  return { ...options, query: { ...options?.query, ...query, ...filterQuery } }\n}\n\n`,
  ]
  const schemas = new Map()
  for (const { document } of documents) {
    for (const name of [...usedSchemas]) {
      if (document.components?.schemas?.[name]) collectSchemaRefs(document, { $ref: `#/components/schemas/${name}` }, usedSchemas)
    }
  }
  for (const { document } of documents) {
    for (const name of usedSchemas) {
      if (!schemas.has(name) && document.components?.schemas?.[name]) schemas.set(name, schemaInterface(document, name, document.components.schemas[name]))
    }
  }
  blocks.push(...[...schemas.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => `${value}\n`))
  blocks.push(...operations.sort((a, b) => a.operation.operationId.localeCompare(b.operation.operationId)).map((operation) => clientFunction(operation, operation.document)))
  return blocks.join('\n')
}

function aggregate(documents) {
  const result = { openapi: '3.1.0', info: { title: 'GoReactRouter Core API', version: '1.0.0', description: 'Generated aggregation of Core authentication and admin contracts.' }, servers: [{ url: '/' }], paths: {}, components: {}, 'x-permissions': {} }
  for (const document of documents) {
    const base = document.servers?.[0]?.url ?? ''
    for (const [route, rawPathItem] of Object.entries(document.paths ?? {})) result.paths[`${base}${route}`] = rawPathItem
    for (const [section, values] of Object.entries(document.components ?? {})) result.components[section] = { ...(result.components[section] ?? {}), ...values }
    Object.assign(result['x-permissions'], document['x-permissions'] ?? {})
  }
  return `${JSON.stringify(result, null, 2)}\n`
}

async function writeOrCheck(relativePath, content, check) {
  const filename = path.join(root, relativePath)
  if (check) {
    const current = existsSync(filename) ? await readFile(filename, 'utf8') : ''
    if (current !== content) throw new Error(`Generated file is stale: ${relativePath}`)
    return
  }
  await writeFile(filename, content)
}

export async function generate({ check = false } = {}) {
  const documents = await Promise.all(contractFiles.map(async (file) => ({ file, document: await loadContract(file) })))
  const operations = documents.flatMap(({ file, document }) => collectOperations(document, file))
  validateOperations(operations)
  await writeOrCheck('admin/generated/core-api/index.ts', buildClient(documents, operations), check)
  await writeOrCheck('backend/openapi/core.openapi.json', aggregate(documents.map(({ document }) => document)), check)
  for (const { file, output } of pluginContracts) {
    const document = await loadContract(file)
    await writeOrCheck(output, buildPluginClient(document, file), check)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generate({ check: process.argv.includes('--check') })
    .then(() => console.log(process.argv.includes('--check') ? 'OpenAPI generated files are up to date.' : 'OpenAPI client and aggregate generated.'))
    .catch((error) => { console.error(error.message); process.exitCode = 1 })
}
