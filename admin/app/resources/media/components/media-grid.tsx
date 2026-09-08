import {
  Archive,
  Check,
  Copy,
  Eye,
  File,
  FileText,
  Film,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaItem } from '../types'

export interface MediaGridProps {
  items: MediaItem[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onSelectItem: (item: MediaItem) => void
  onDeleteItem: (item: MediaItem) => void
  onCopyUrl: (url: string) => void
}

export function MediaGrid({
  items,
  selectedIds,
  onToggleSelect,
  onSelectItem,
  onDeleteItem,
  onCopyUrl,
}: MediaGridProps) {
  const { t } = useTranslation()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
  }

  const handleCopy = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation()
    onCopyUrl(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (items.length === 0) {
    return (
      <div className="bg-muted/10 flex flex-col items-center justify-center rounded-xl border py-16 text-center">
        <div className="bg-muted/60 text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
          <File className="size-6" />
        </div>
        <div className="text-foreground text-sm font-semibold">
          {t('resources.media.grid.emptyTitle')}
        </div>
        <div className="text-muted-foreground mt-1 max-w-xs text-xs">
          {t('resources.media.grid.emptyDescription')}
        </div>
      </div>
    )
  }

  const renderPreview = (item: MediaItem) => {
    if (item.type === 'image') {
      return (
        <img
          src={item.thumbnailUrl || item.url}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )
    }

    if (item.type === 'document') {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-emerald-500/10 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <FileText className="size-8" />
          <span className="font-mono text-xs font-medium tracking-wider uppercase">
            {item.name.split('.').pop() || 'DOC'}
          </span>
        </div>
      )
    }

    if (item.type === 'video') {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-purple-500/10 p-2 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
          <Film className="size-8" />
          <span className="font-mono text-xs font-medium tracking-wider uppercase">
            VIDEO
          </span>
        </div>
      )
    }

    if (item.type === 'archive') {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-amber-500/10 p-2 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Archive className="size-8" />
          <span className="font-mono text-xs font-medium tracking-wider uppercase">
            {item.name.split('.').pop() || 'ARCHIVE'}
          </span>
        </div>
      )
    }

    return (
      <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1">
        <File className="size-8" />
        <span className="font-mono text-xs">FILE</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id)
        const ext =
          item.name.split('.').pop()?.toUpperCase() || item.type.toUpperCase()

        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: media card click selects the item
          // biome-ignore lint/a11y/noStaticElementInteractions: media card click selects the item
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`group bg-card text-card-foreground relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'ring-primary border-primary ring-2'
                : 'hover:border-border/80'
            }`}
          >
            {/* 缩略图与格式标识 */}
            <div className="bg-muted/40 relative aspect-4/3 w-full overflow-hidden">
              {renderPreview(item)}

              {/* 多选框 */}
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: custom checkbox overlay, stopPropagation guards the card click */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: custom checkbox overlay, stopPropagation guards the card click */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect(item.id)
                }}
                className={`absolute top-2 left-2 flex size-5 items-center justify-center rounded border transition-all ${
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background/80 border-border/80 opacity-0 backdrop-blur-xs group-hover:opacity-100'
                }`}
              >
                {isSelected && <Check className="size-3 stroke-3" />}
              </div>

              {/* 格式微徽标 */}
              <div className="bg-background/80 text-foreground/80 border-border/40 absolute top-2 right-2 rounded border px-1.5 py-0.5 font-mono text-xs font-semibold shadow-xs backdrop-blur-xs">
                {ext}
              </div>

              {/* 悬停快速操作遮罩 */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, item)}
                  className="bg-background/80 hover:bg-background text-foreground flex size-7 cursor-pointer items-center justify-center rounded transition-colors"
                  title={t('resources.media.grid.copyUrl')}
                >
                  {copiedId === item.id ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectItem(item)
                  }}
                  className="bg-background/80 hover:bg-background text-foreground flex size-7 cursor-pointer items-center justify-center rounded transition-colors"
                  title={t('resources.media.grid.viewDetails')}
                >
                  <Eye className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteItem(item)
                  }}
                  className="bg-destructive/80 hover:bg-destructive text-destructive-foreground flex size-7 cursor-pointer items-center justify-center rounded transition-colors"
                  title={t('common.actions.delete')}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 文件名与基础信息 */}
            <div className="flex flex-1 flex-col justify-between gap-0.5 p-2.5">
              <div
                className="text-foreground group-hover:text-primary truncate text-xs font-medium transition-colors"
                title={item.name}
              >
                {item.name}
              </div>
              <div className="text-muted-foreground flex items-center justify-between pt-1 font-mono text-xs">
                <span>{formatSize(item.size)}</span>
                <span className="max-w-[70px] truncate">
                  {item.folder || t('resources.media.folders.ungrouped')}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
