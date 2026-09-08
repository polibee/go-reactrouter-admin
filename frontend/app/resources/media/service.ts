// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import { mediaRepository } from './repository'
import type {
  MediaCategoryDef,
  MediaDimensions,
  MediaFilterParams,
  MediaItem,
  MediaStorageStats,
  MediaType,
} from './types'

export class MediaService {
  async getMediaList(params?: MediaFilterParams): Promise<MediaItem[]> {
    return mediaRepository.getItems(params)
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    return mediaRepository.getItemById(id)
  }

  async uploadFile(
    file: File,
    folder?: string,
    tags?: string[],
  ): Promise<MediaItem> {
    const type = this.detectMediaType(file.name, file.type)

    let url = ''
    let dimensions: MediaDimensions | undefined

    // Handle preview and URL generation
    if (typeof window !== 'undefined') {
      if (file.type.startsWith('image/')) {
        // Read dimensions & generate local DataURL
        try {
          const dataUrl = await this.fileToDataUrl(file)
          url = dataUrl
          dimensions = await this.getImageDimensions(dataUrl)
        } catch {
          url = URL.createObjectURL(file)
        }
      } else {
        url = URL.createObjectURL(file)
      }
    } else {
      url = `/uploads/${file.name}`
    }

    if (folder) {
      // Uploading into a free-typed folder name registers it as a category
      await mediaRepository.saveCategory({ name: folder })
    }

    const payload: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: file.name,
      originalName: file.name,
      type,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url,
      thumbnailUrl: type === 'image' ? url : undefined,
      dimensions,
      folder: folder || undefined,
      tags: tags || [],
    }

    return mediaRepository.saveItem(payload)
  }

  async updateMedia(id: string, patch: Partial<MediaItem>): Promise<MediaItem> {
    return mediaRepository.updateItem(id, patch)
  }

  async deleteMedia(id: string): Promise<boolean> {
    return mediaRepository.deleteItem(id)
  }

  async deleteBatch(ids: string[]): Promise<number> {
    return mediaRepository.deleteBatch(ids)
  }

  async getCategories(): Promise<MediaCategoryDef[]> {
    return mediaRepository.getCategories()
  }

  async saveCategory(input: {
    id?: string
    name: string
    sort?: number
  }): Promise<MediaCategoryDef> {
    return mediaRepository.saveCategory(input)
  }

  async deleteCategory(id: string): Promise<boolean> {
    return mediaRepository.deleteCategory(id)
  }

  async getStorageStats(): Promise<MediaStorageStats> {
    return mediaRepository.getStorageStats()
  }

  async getFolders(): Promise<string[]> {
    return mediaRepository.getFolders()
  }

  detectMediaType(filename: string, mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation') ||
      mimeType.includes('text') ||
      /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv)$/i.test(filename)
    ) {
      return 'document'
    }
    if (
      mimeType.includes('zip') ||
      mimeType.includes('tar') ||
      mimeType.includes('rar') ||
      mimeType.includes('7z') ||
      mimeType.includes('compressed') ||
      /\.(zip|tar|gz|rar|7z)$/i.test(filename)
    ) {
      return 'archive'
    }
    if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(filename)) return 'image'
    if (/\.(mp4|mov|avi|mkv|webm)$/i.test(filename)) return 'video'
    return 'other'
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private getImageDimensions(src: string): Promise<MediaDimensions> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => resolve({ width: 0, height: 0 })
      img.src = src
    })
  }
}

export const mediaService = new MediaService()
