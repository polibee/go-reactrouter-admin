export interface PluginApiResponse<T> {
  data: T
  message?: string
  meta?: Record<string, unknown>
  requestId?: string
}

export interface PluginRequestOptions {
  baseUrl?: string
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
  fetcher?: typeof fetch
}

export class PluginApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fields?: Record<string, string[]>
  readonly requestId?: string

  constructor(message: string, status: number, code?: string, fields?: Record<string, string[]>, requestId?: string) {
    super(message)
    this.name = 'PluginApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.requestId = requestId
  }
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `plugin-req-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildUrl(pluginId: string, path: string, options: PluginRequestOptions): string {
  const baseUrl = (options.baseUrl ?? '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}/api/v1/plugins/${encodeURIComponent(pluginId)}${normalizedPath}`
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) query.set(key, String(value))
  }
  const encodedQuery = query.toString()
  return encodedQuery ? `${url}?${encodedQuery}` : url
}

export async function pluginRequest<T>(
  pluginId: string,
  method: string,
  path: string,
  body?: unknown,
  options: PluginRequestOptions = {},
): Promise<PluginApiResponse<T>> {
  const fetcher = options.fetcher ?? fetch
  const response = await fetcher(buildUrl(pluginId, path, options), {
    method,
    credentials: 'include',
    headers: {
      'X-Request-ID': options.headers?.['X-Request-ID'] ?? createRequestId(),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options.signal,
  })

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }
  if (!response.ok) {
    const errorPayload = typeof payload === 'object' && payload !== null ? (payload as { error?: { code?: string; message?: string; fields?: Record<string, string[]> }; requestId?: string }) : {}
    throw new PluginApiError(
      errorPayload.error?.message ?? `Plugin request failed with status ${response.status}`,
      response.status,
      errorPayload.error?.code,
      errorPayload.error?.fields,
      errorPayload.requestId,
    )
  }
  return (payload ?? { data: null }) as PluginApiResponse<T>
}
