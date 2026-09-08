// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import type {
  MediaCategoryDef,
  MediaFilterParams,
  MediaItem,
  MediaStorageStats,
  MediaType,
} from './types'

const STORAGE_KEY_MEDIA = 'site_media_items_v1'
const STORAGE_KEY_CATEGORIES = 'site_media_categories_v1'
const STORAGE_KEY_META = 'site_media_meta_v1'

const FALLBACK_STORAGE_QUOTA = 500 * 1024 * 1024

const SEED_MEDIA_CATEGORIES: MediaCategoryDef[] = [
  {
    id: 'mcat-1',
    name: 'Site Images',
    sort: 10,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-2',
    name: 'System Architecture',
    sort: 20,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-3',
    name: 'Development Guidelines',
    sort: 30,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-4',
    name: 'Business Reports',
    sort: 40,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-5',
    name: 'Team News',
    sort: 50,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-6',
    name: 'Compliance',
    sort: 60,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mcat-7',
    name: 'Promo Videos',
    sort: 70,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
]

// One-shot migration for localStorage data written before categories became
// manageable; runs once guarded by the META flag, then never again.
const LEGACY_FOLDER_MAP: Record<string, string> = {
  站点配图: 'Site Images',
  系统架构: 'System Architecture',
  开发规范: 'Development Guidelines',
  业务报表: 'Business Reports',
  团队动态: 'Team News',
  合规文件: 'Compliance',
  宣传视频: 'Promo Videos',
  未分组: '',
}

export const SEED_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    name: 'react-admin-architecture.png',
    originalName: 'react-admin-architecture.png',
    type: 'image',
    mimeType: 'image/png',
    size: 1428500, // ~1.4 MB
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 1920, height: 1080 },
    folder: 'System Architecture',
    tags: ['架构图', '拓扑', '后台'],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'med-2',
    name: 'hero-banner-future.jpg',
    originalName: 'hero-banner-future.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 892400, // ~890 KB
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 2400, height: 1200 },
    folder: 'Site Images',
    tags: ['Banner', '首页', '现代化'],
    createdAt: '2026-03-02T11:20:00.000Z',
    updatedAt: '2026-03-02T11:20:00.000Z',
  },
  {
    id: 'med-3',
    name: 'team-collaboration.jpg',
    originalName: 'team-collaboration.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 2150000, // ~2.1 MB
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 2048, height: 1365 },
    folder: 'Team News',
    tags: ['团队', '研发', '办公'],
    createdAt: '2026-03-02T14:30:00.000Z',
    updatedAt: '2026-03-02T14:30:00.000Z',
  },
  {
    id: 'med-4',
    name: 'admin-dashboard-preview.png',
    originalName: 'admin-dashboard-preview.png',
    type: 'image',
    mimeType: 'image/png',
    size: 1680000, // ~1.6 MB
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 1920, height: 1200 },
    folder: 'Site Images',
    tags: ['控制台', '看板', 'UI'],
    createdAt: '2026-03-03T09:15:00.000Z',
    updatedAt: '2026-03-03T09:15:00.000Z',
  },
  {
    id: 'med-5',
    name: 'platform-developer-guide.pdf',
    originalName: 'platform-developer-guide.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 4520000, // ~4.5 MB
    url: '/docs/developer-guide.pdf',
    folder: 'Development Guidelines',
    tags: ['PDF', '技术手册', '开发指南'],
    createdAt: '2026-03-03T16:45:00.000Z',
    updatedAt: '2026-03-03T16:45:00.000Z',
  },
  {
    id: 'med-6',
    name: 'data-analysis-report-q1.xlsx',
    originalName: 'data-analysis-report-q1.xlsx',
    type: 'document',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 780000, // ~780 KB
    url: '/docs/q1-report.xlsx',
    folder: 'Business Reports',
    tags: ['Excel', '财务', 'Q1报告'],
    createdAt: '2026-03-04T08:10:00.000Z',
    updatedAt: '2026-03-04T08:10:00.000Z',
  },
  {
    id: 'med-7',
    name: 'privacy-policy-whitepaper.docx',
    originalName: 'privacy-policy-whitepaper.docx',
    type: 'document',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 320000, // ~320 KB
    url: '/docs/privacy-whitepaper.docx',
    folder: 'Compliance',
    tags: ['Word', '隐私政策', '法务'],
    createdAt: '2026-03-04T12:00:00.000Z',
    updatedAt: '2026-03-04T12:00:00.000Z',
  },
  {
    id: 'med-8',
    name: 'brand-identity-vectors.zip',
    originalName: 'brand-identity-vectors.zip',
    type: 'archive',
    mimeType: 'application/zip',
    size: 12500000, // ~12.5 MB
    url: '/assets/brand-pack.zip',
    folder: 'Site Images',
    tags: ['ZIP', '品牌素材', 'SVG图标'],
    createdAt: '2026-03-05T10:30:00.000Z',
    updatedAt: '2026-03-05T10:30:00.000Z',
  },
  {
    id: 'med-9',
    name: 'product-tour-overview.mp4',
    originalName: 'product-tour-overview.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 18600000, // ~18.6 MB
    url: '/videos/product-tour.mp4',
    folder: 'Promo Videos',
    tags: ['视频', '演示', '入门教程'],
    createdAt: '2026-03-05T15:20:00.000Z',
    updatedAt: '2026-03-05T15:20:00.000Z',
  },
]

export class MediaRepository {
  private getStorage(): MediaItem[] {
    if (typeof window === 'undefined') return SEED_MEDIA
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MEDIA)
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(SEED_MEDIA))
        return this.normalizeStorage(SEED_MEDIA)
      }
      return this.normalizeStorage(JSON.parse(raw))
    } catch {
      return SEED_MEDIA
    }
  }

  private setStorage(items: MediaItem[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to persist media items:', e)
    }
  }

  private getCategoriesStorage(): MediaCategoryDef[] {
    if (typeof window === 'undefined') return SEED_MEDIA_CATEGORIES
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES)
      if (!raw) {
        localStorage.setItem(
          STORAGE_KEY_CATEGORIES,
          JSON.stringify(SEED_MEDIA_CATEGORIES),
        )
        return SEED_MEDIA_CATEGORIES
      }
      return JSON.parse(raw)
    } catch {
      return SEED_MEDIA_CATEGORIES
    }
  }

  private setCategoriesStorage(categories: MediaCategoryDef[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories))
    } catch (e) {
      console.warn('Failed to persist media categories:', e)
    }
  }

  private normalizeStorage(items: MediaItem[]): MediaItem[] {
    if (typeof window === 'undefined') return items
    try {
      if (localStorage.getItem(STORAGE_KEY_META)) return items
      let dirty = false
      const migrated = items.map((item) => {
        if (!item.folder) return item
        const mapped = LEGACY_FOLDER_MAP[item.folder]
        if (mapped === undefined) return item
        dirty = true
        return { ...item, folder: mapped || undefined }
      })
      localStorage.setItem(
        STORAGE_KEY_META,
        JSON.stringify({ legacyFolderMigrated: true }),
      )
      if (dirty) {
        localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(migrated))
      }
      return migrated
    } catch {
      return items
    }
  }

  async getItems(params?: MediaFilterParams): Promise<MediaItem[]> {
    let items = this.getStorage()

    if (params) {
      if (params.category && params.category !== 'all') {
        items = items.filter((item) => item.type === params.category)
      }
      if (params.folder && params.folder !== 'all') {
        items = items.filter((item) => item.folder === params.folder)
      }
      if (params.search?.trim()) {
        const q = params.search.toLowerCase().trim()
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.originalName.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q)),
        )
      }

      if (params.sortBy) {
        items = [...items].sort((a, b) => {
          switch (params.sortBy) {
            case 'date_desc':
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              )
            case 'date_asc':
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              )
            case 'size_desc':
              return b.size - a.size
            case 'size_asc':
              return a.size - b.size
            case 'name_asc':
              return a.name.localeCompare(b.name)
            default:
              return 0
          }
        })
      } else {
        // default: newest first
        items = [...items].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
    }

    return items
  }

  async getItemById(id: string): Promise<MediaItem | null> {
    const items = this.getStorage()
    return items.find((i) => i.id === id) || null
  }

  async saveItem(
    item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MediaItem> {
    const items = this.getStorage()
    const now = new Date().toISOString()
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    }
    this.setStorage([newItem, ...items])
    return newItem
  }

  async updateItem(id: string, patch: Partial<MediaItem>): Promise<MediaItem> {
    const items = this.getStorage()
    const target = items.find((i) => i.id === id)
    if (!target) throw new Error(`Media asset with id "${id}" not found`)

    const updated: MediaItem = {
      ...target,
      ...patch,
      updatedAt: new Date().toISOString(),
    }

    this.setStorage(items.map((i) => (i.id === id ? updated : i)))
    return updated
  }

  async deleteItem(id: string): Promise<boolean> {
    const items = this.getStorage()
    this.setStorage(items.filter((i) => i.id !== id))
    return true
  }

  async deleteBatch(ids: string[]): Promise<number> {
    const idSet = new Set(ids)
    const items = this.getStorage()
    const remaining = items.filter((i) => !idSet.has(i.id))
    this.setStorage(remaining)
    return items.length - remaining.length
  }

  async getCategories(): Promise<MediaCategoryDef[]> {
    let categories = this.getCategoriesStorage()
    const items = this.getStorage()

    // Self-heal: folder values on items without a matching category
    // (e.g. imported data) become new categories instead of vanishing
    const known = new Set(categories.map((c) => c.name))
    const missing = new Set<string>()
    for (const item of items) {
      if (item.folder && !known.has(item.folder)) missing.add(item.folder)
    }
    if (missing.size > 0) {
      const now = new Date().toISOString()
      const added = Array.from(missing).map((name, index) => ({
        id: `mcat-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        name,
        sort: 1000 + index * 10,
        createdAt: now,
        updatedAt: now,
      }))
      categories = [...categories, ...added]
      this.setCategoriesStorage(categories)
    }

    return [...categories].sort((a, b) => a.sort - b.sort)
  }

  async saveCategory(input: {
    id?: string
    name: string
    sort?: number
  }): Promise<MediaCategoryDef> {
    const categories = this.getCategoriesStorage()
    const now = new Date().toISOString()

    if (input.id) {
      const target = categories.find((c) => c.id === input.id)
      if (!target) {
        throw new Error(`Media category with id "${input.id}" not found`)
      }
      const updated: MediaCategoryDef = {
        ...target,
        name: input.name,
        sort: input.sort ?? target.sort,
        updatedAt: now,
      }
      this.setCategoriesStorage(
        categories.map((c) => (c.id === input.id ? updated : c)),
      )
      if (target.name !== input.name) {
        // Rename cascades to every item assigned to the old category
        const items = this.getStorage()
        this.setStorage(
          items.map((item) =>
            item.folder === target.name
              ? { ...item, folder: input.name }
              : item,
          ),
        )
      }
      return updated
    }

    const existing = categories.find((c) => c.name === input.name)
    if (existing) return existing

    const created: MediaCategoryDef = {
      id: `mcat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: input.name,
      sort: input.sort ?? 10,
      createdAt: now,
      updatedAt: now,
    }
    this.setCategoriesStorage([...categories, created])
    return created
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = this.getCategoriesStorage()
    const target = categories.find((c) => c.id === id)
    if (!target) return false

    this.setCategoriesStorage(categories.filter((c) => c.id !== id))
    const items = this.getStorage()
    this.setStorage(
      items.map((item) =>
        item.folder === target.name ? { ...item, folder: undefined } : item,
      ),
    )
    return true
  }

  async getStorageStats(): Promise<MediaStorageStats> {
    const items = this.getStorage()
    const byType: Record<MediaType, { bytes: number; count: number }> = {
      image: { bytes: 0, count: 0 },
      document: { bytes: 0, count: 0 },
      video: { bytes: 0, count: 0 },
      archive: { bytes: 0, count: 0 },
      other: { bytes: 0, count: 0 },
    }

    let totalBytes = 0
    for (const item of items) {
      totalBytes += item.size
      if (byType[item.type]) {
        byType[item.type].bytes += item.size
        byType[item.type].count += 1
      } else {
        byType.other.bytes += item.size
        byType.other.count += 1
      }
    }

    return {
      totalBytes,
      maxBytes: await this.resolveStorageQuota(),
      totalCount: items.length,
      byType,
    }
  }

  // navigator.storage.estimate() reports a browser-calculated quota derived
  // from the machine's free disk space; fall back to a preset when unsupported
  private async resolveStorageQuota(): Promise<number> {
    if (typeof window === 'undefined') return FALLBACK_STORAGE_QUOTA
    try {
      const estimate = await navigator.storage?.estimate?.()
      if (estimate?.quota && estimate.quota > 0) return estimate.quota
    } catch {
      // unsupported or denied — fall back to the preset quota
    }
    return FALLBACK_STORAGE_QUOTA
  }

  async getFolders(): Promise<string[]> {
    const categories = await this.getCategories()
    const items = this.getStorage()
    const folders = new Set<string>()
    for (const category of categories) folders.add(category.name)
    for (const item of items) {
      if (item.folder) folders.add(item.folder)
    }
    return Array.from(folders)
  }
}

export const mediaRepository = new MediaRepository()
