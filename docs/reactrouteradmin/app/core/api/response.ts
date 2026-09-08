export interface ApiResponseMeta {
  page?: number
  total?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: ApiResponseMeta
}
