export type MediaType = 'image' | 'document' | 'video' | 'archive' | 'other'

export type MediaCategory = 'all' | MediaType

export interface MediaCategoryDef {
  id: string
  name: string
  sort: number
  createdAt: string
  updatedAt: string
}

export interface MediaCategoryFormValues {
  name: string
  sort: number
}

export interface MediaDimensions {
  width: number
  height: number
}

export interface MediaItem {
  id: string
  name: string
  originalName: string
  type: MediaType
  mimeType: string
  size: number // in bytes
  url: string
  thumbnailUrl?: string
  dimensions?: MediaDimensions
  folder?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface MediaFolder {
  id: string
  name: string
  color?: string
  itemCount: number
}

export interface MediaStorageStats {
  totalBytes: number
  maxBytes: number // browser disk-derived quota (StorageManager), preset fallback
  totalCount: number
  byType: Record<MediaType, { bytes: number; count: number }>
}

export interface MediaFilterParams {
  category?: MediaCategory
  folder?: string
  search?: string
  sortBy?: 'date_desc' | 'date_asc' | 'size_desc' | 'size_asc' | 'name_asc'
}

export interface MediaUploadPayload {
  name: string
  file: File
  folder?: string
  tags?: string[]
}
