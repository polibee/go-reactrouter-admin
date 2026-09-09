import type { ApiErrorBody, ApiResponse } from './contracts'
import { ApiError } from './errors'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) search.set(key, String(value))
  }
  const qs = search.toString()
  return `${baseUrl}${path}${qs ? `?${qs}` : ''}`
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(buildUrl(path, options.query), {
    method,
    credentials: 'include',
    headers: {
      'X-Request-ID': options.headers?.['X-Request-ID'] ?? createRequestId(),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
    const errorPayload: Partial<ApiErrorBody> =
      typeof payload === 'object' && payload !== null
        ? (payload as Partial<ApiErrorBody>)
        : {}
    const details = errorPayload.error
    throw new ApiError(
      details?.message ?? `Request failed with status ${response.status}`,
      response.status,
      details?.code,
      details?.fields,
      errorPayload.requestId,
    )
  }

  return (payload ?? { data: null }) as ApiResponse<T>
}

export { request }
