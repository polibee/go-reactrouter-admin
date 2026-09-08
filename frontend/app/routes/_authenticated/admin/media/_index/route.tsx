import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdminConfirmDialog,
  AdminLoading,
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
  notify,
} from '~/components/admin'
import { i18n } from '~/core/i18n'
import {
  MediaCategoryManager,
  MediaGrid,
  MediaInspector,
  mediaService,
  MediaStorageStatsCard,
  MediaTable,
  MediaToolbar,
  MediaUploadDialog,
  type MediaCategory,
  type MediaCategoryDef,
  type MediaItem,
  type MediaStorageStats,
} from '~/resources/media'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.media.metaTitle') }]
}

export const handle = {
  breadcrumb: () => ({ label: i18n.t('pages.admin.media.title') }),
}

export default function MediaAdminRoute() {
  const { t } = useTranslation()
  const [items, setItems] = useState<MediaItem[]>([])
  const [stats, setStats] = useState<MediaStorageStats | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const [categories, setCategories] = useState<MediaCategoryDef[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Views
  const [category, setCategory] = useState<MediaCategory>('all')
  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Selections & Inspector
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [mediaList, storageStats, folderList, categoryList] =
        await Promise.all([
          mediaService.getMediaList({
            category,
            folder: folder === 'all' ? undefined : folder,
            search,
          }),
          mediaService.getStorageStats(),
          mediaService.getFolders(),
          mediaService.getCategories(),
        ])
      setItems(mediaList)
      setStats(storageStats)
      setFolders(folderList)
      setCategories(categoryList)
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [category, folder, search, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (!item.folder) continue
      counts[item.folder] = (counts[item.folder] ?? 0) + 1
    }
    return counts
  }, [items])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleDelete = async (item: MediaItem) => {
    try {
      await mediaService.deleteMedia(item.id)
      notify.success(t('pages.admin.media.deleteSuccess', { name: item.name }))
      if (inspectItem?.id === item.id) {
        setInspectItem(null)
      }
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.deleteFailed'))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      const count = await mediaService.deleteBatch(selectedIds)
      notify.success(t('pages.admin.media.batchDeleteSuccess', { count }))
      setSelectedIds([])
      setInspectItem(null)
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.batchDeleteFailed'))
    }
  }

  const handleUpdate = async (id: string, patch: Partial<MediaItem>) => {
    try {
      const updated = await mediaService.updateMedia(id, patch)
      notify.success(t('pages.admin.media.updateSuccess'))
      setInspectItem(updated)
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.updateFailed'))
    }
  }

  const resolveFullUrl = (url: string) => {
    if (
      url.startsWith('http') ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ) {
      return url
    }
    return `${window.location.origin}${url}`
  }

  const handleCopyUrl = (url: string) => {
    const fullUrl = resolveFullUrl(url)

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl)
      notify.success(t('pages.admin.media.copySuccess'))
    } else {
      notify.info(t('pages.admin.media.linkInfo', { url: fullUrl }))
    }
  }

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      notify.success(t('pages.admin.media.copySuccess'))
    } else {
      notify.info(t('pages.admin.media.linkInfo', { url: text }))
    }
  }

  const handleCategorySave = async (values: {
    id?: string
    name: string
    sort: number
  }) => {
    try {
      await mediaService.saveCategory(values)
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.updateFailed'))
    }
  }

  const handleCategoryDelete = async (target: MediaCategoryDef) => {
    try {
      await mediaService.deleteCategory(target.id)
      if (folder === target.name) {
        setFolder('all')
      }
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.media.updateFailed'))
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.media.heading')}
        description={t('pages.admin.media.description')}
      />

      <AdminPageContent className="space-y-4">
        {/* 1. 存储用量与多类型文件占比指示板 */}
        <MediaStorageStatsCard stats={stats} loading={loading && !stats} />

        {/* 2. 媒体库工具栏：分类标签、搜索框、视图模式切换、上传按钮 */}
        <MediaToolbar
          category={category}
          onCategoryChange={setCategory}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          folders={folders}
          selectedFolder={folder}
          onFolderChange={setFolder}
          onOpenCategoryManager={() => setCategoryManagerOpen(true)}
          selectedCount={selectedIds.length}
          onBatchDelete={() => setBatchConfirmOpen(true)}
          onOpenUpload={() => setUploadOpen(true)}
        />

        {/* 3. 媒体主体展示：网格模式 vs 表格模式 */}
        {loading && items.length === 0 ? (
          <AdminLoading text={t('pages.admin.media.loading')} />
        ) : viewMode === 'grid' ? (
          <MediaGrid
            items={items}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectItem={(item) => setInspectItem(item)}
            onDeleteItem={handleDelete}
            onCopyUrl={handleCopyUrl}
          />
        ) : (
          <MediaTable
            data={items}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectItem={(item) => setInspectItem(item)}
            onDeleteItem={handleDelete}
            onCopyUrl={handleCopyUrl}
          />
        )}

        {/* 4. 右侧属性检视与大图抽屉 */}
        <MediaInspector
          item={inspectItem}
          open={!!inspectItem}
          onClose={() => setInspectItem(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
          fullUrl={inspectItem ? resolveFullUrl(inspectItem.url) : undefined}
          onCopyText={handleCopyText}
        />

        {/* 5. 拖拽批量上传弹窗 */}
        <MediaUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          categories={categories}
          onUploaded={loadData}
        />

        {/* 6. 分类（文件夹）管理弹窗：增删改 + 条目迁移 */}
        <MediaCategoryManager
          open={categoryManagerOpen}
          onOpenChange={setCategoryManagerOpen}
          categories={categories}
          itemCounts={itemCounts}
          onSave={handleCategorySave}
          onDelete={handleCategoryDelete}
        />

        {/* 7. 批量删除确认框 */}
        <AdminConfirmDialog
          open={batchConfirmOpen}
          onOpenChange={setBatchConfirmOpen}
          title={t('common.confirm.bulkDeleteTitle', {
            count: selectedIds.length,
          })}
          description={t('common.confirm.bulkDeleteDescription')}
          variant="destructive"
          onConfirm={handleBatchDelete}
        />
      </AdminPageContent>
    </AdminPage>
  )
}
