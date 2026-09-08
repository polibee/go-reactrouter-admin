import { request, type RequestOptions } from './request'

export const api = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, undefined, options)
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, body, options)
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', path, body, options)
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, body, options)
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>('DELETE', path, undefined, options)
  },
}
