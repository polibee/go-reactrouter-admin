import {
  Archive,
  FileText,
  Film,
  Filter,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  List,
  Search,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { MediaCategory } from '../types'

export interface MediaToolbarProps {
  category: MediaCategory
  onCategoryChange: (cat: MediaCategory) => void
  search: string
  onSearchChange: (q: string) => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  folders: string[]
  selectedFolder: string
  onFolderChange: (f: string) => void
  onOpenCategoryManager: () => void
  selectedCount: number
  onBatchDelete: () => void
  onOpenUpload: () => void
}

export function MediaToolbar({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  folders,
  selectedFolder,
  onFolderChange,
  onOpenCategoryManager,
  selectedCount,
  onBatchDelete,
  onOpenUpload,
}: MediaToolbarProps) {
  const { t } = useTranslation()
  const categoryTabs: {
    key: MediaCategory
    labelKey:
      | 'resources.media.toolbar.categories.all'
      | 'resources.media.toolbar.categories.image'
      | 'resources.media.toolbar.categories.document'
      | 'resources.media.toolbar.categories.video'
      | 'resources.media.toolbar.categories.archive'
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    {
      key: 'all',
      labelKey: 'resources.media.toolbar.categories.all',
      icon: Layers,
    },
    {
      key: 'image',
      labelKey: 'resources.media.toolbar.categories.image',
      icon: ImageIcon,
    },
    {
      key: 'document',
      labelKey: 'resources.media.toolbar.categories.document',
      icon: FileText,
    },
    {
      key: 'video',
      labelKey: 'resources.media.toolbar.categories.video',
      icon: Film,
    },
    {
      key: 'archive',
      labelKey: 'resources.media.toolbar.categories.archive',
      icon: Archive,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        {/* 分类快捷标签 */}
        <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = category === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onCategoryChange(tab.key)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>

        {/* 右侧动作区：上传按钮与批量操作 */}
        <div className="flex shrink-0 items-center gap-2">
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onBatchDelete}
            >
              <Trash2 className="size-3.5" />
              <span>
                {t('resources.media.toolbar.batchDelete', {
                  selected: selectedCount,
                })}
              </span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 text-xs shadow-xs"
            onClick={onOpenUpload}
          >
            <Upload className="size-3.5" />
            <span>{t('resources.media.toolbar.upload')}</span>
          </Button>
        </div>
      </div>

      {/* 第二栏：搜索、文件夹筛选与视图模式切换 */}
      <div className="border-border/40 flex flex-col justify-between gap-2.5 border-t pt-1 sm:flex-row sm:items-center">
        <div className="flex max-w-md flex-1 items-center gap-2">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('resources.media.toolbar.searchPlaceholder')}
              className="bg-muted/20 h-8 w-full pl-8 text-xs"
            />
          </div>

          {folders.length > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <Filter className="text-muted-foreground ml-1 size-3.5" />
              <select
                value={selectedFolder}
                onChange={(e) => onFolderChange(e.target.value)}
                className="border-input bg-muted/20 text-foreground focus:ring-ring h-8 rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
              >
                <option value="all">
                  {t('resources.media.toolbar.allFolders')}
                </option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 shrink-0"
            onClick={onOpenCategoryManager}
            title={t('resources.media.toolbar.manageCategories')}
          >
            <Settings2 className="size-3.5" />
          </Button>
        </div>

        {/* 视图切换 (Grid vs Table) */}
        <div className="bg-muted/30 flex items-center gap-1 self-end rounded-lg border p-0.5 sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`cursor-pointer rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={t('resources.media.toolbar.gridView')}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`cursor-pointer rounded-md p-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={t('resources.media.toolbar.tableView')}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
