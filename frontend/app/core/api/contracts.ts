export interface ApiResponseMeta {
  page?: number
  pageSize?: number
  total?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: ApiResponseMeta
  requestId?: string
}

export interface ApiErrorDetails {
  code: string
  message: string
  fields?: Record<string, string[]>
}

export interface ApiErrorBody {
  error: ApiErrorDetails
  requestId?: string
}

export type PluginState =
  | 'discovered'
  | 'verifying'
  | 'installed'
  | 'enabling'
  | 'enabled'
  | 'disabling'
  | 'disabled'
  | 'uninstalling'
  | 'failed'
  | 'uninstalled'

export interface PluginDescriptor {
  id: string
  version: string
  apiVersion: string
  coreRequires: string
}
