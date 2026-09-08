import { ApiError } from './errors'
import type { ApiResponse } from './response'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) search.set(key, String(value))
  }
  const qs = search.toString()
  return `${baseUrl}${path}${qs ? `?${qs}` : ''}`
}

interface ErrorPayload {
  message?: string
  code?: string
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers: {
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
    const errorPayload: ErrorPayload =
      typeof payload === 'object' && payload !== null ? payload : {}
    throw new ApiError(
      errorPayload.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorPayload.code,
    )
  }

  return (payload ?? { data: null }) as ApiResponse<T>
}

export { request }
