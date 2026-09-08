import type { ColumnDef } from '@tanstack/react-table'
import { Archive, Check, Copy, File, FileText, Film } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdminBadge,
  AdminTable,
  DeleteAction,
  ViewAction,
} from '~/components/admin'
import type { MediaItem, MediaType } from '../types'

export interface MediaTableProps {
  data: MediaItem[]
  loading?: boolean
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onSelectItem: (item: MediaItem) => void
  onDeleteItem: (item: MediaItem) => void
  onCopyUrl: (url: string) => void
}

const typeBadgeKeys: Record<
  MediaType,
  | 'resources.media.table.badges.image'
  | 'resources.media.table.badges.document'
  | 'resources.media.table.badges.video'
  | 'resources.media.table.badges.archive'
  | 'resources.media.table.badges.other'
> = {
  image: 'resources.media.table.badges.image',
  document: 'resources.media.table.badges.document',
  video: 'resources.media.table.badges.video',
  archive: 'resources.media.table.badges.archive',
  other: 'resources.media.table.badges.other',
}

const typeBadgeStatus: Record<
  MediaType,
  'success' | 'info' | 'warning' | 'default'
> = {
  image: 'success',
  document: 'info',
  video: 'warning',
  archive: 'default',
  other: 'default',
}

export function MediaTable({
  data,
  loading,
  selectedIds,
  onToggleSelect,
  onSelectItem,
  onDeleteItem,
  onCopyUrl,
}: MediaTableProps) {
  const { t } = useTranslation()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
  }

  const handleCopy = (item: MediaItem) => {
    onCopyUrl(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const columns: ColumnDef<MediaItem>[] = [
    {
      id: 'select',
      header: () => <div className="w-4" />,
      cell: ({ row }) => {
        const isSelected = selectedIds.includes(row.original.id)
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: custom checkbox cell, selection is also available via table row interactions
          // biome-ignore lint/a11y/noStaticElementInteractions: custom checkbox cell, selection is also available via table row interactions
          <div
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(row.original.id)
            }}
            className={`flex size-4 cursor-pointer items-center justify-center rounded border transition-colors ${
              isSelected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border hover:border-primary'
            }`}
          >
            {isSelected && <Check className="size-3 stroke-3" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: t('resources.media.table.nameHeader'),
      cell: ({ row }) => {
        const item = row.original
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: media cell opens the item inspector
          // biome-ignore lint/a11y/noStaticElementInteractions: media cell opens the item inspector
          <div
            className="group flex cursor-pointer items-center gap-3"
            onClick={() => onSelectItem(item)}
          >
            <div className="bg-muted/30 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
              {item.type === 'image' ? (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : item.type === 'document' ? (
                <FileText className="size-5 text-emerald-500" />
              ) : item.type === 'video' ? (
                <Film className="size-5 text-purple-500" />
              ) : item.type === 'archive' ? (
                <Archive className="size-5 text-amber-500" />
              ) : (
                <File className="text-muted-foreground size-5" />
              )}
            </div>
            <div>
              <div className="text-foreground group-hover:text-primary max-w-[240px] truncate font-medium transition-colors">
                {item.name}
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {item.mimeType}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: t('common.labels.type'),
      cell: ({ row }) => {
        const mediaType = row.original.type
        return (
          <AdminBadge status={typeBadgeStatus[mediaType]}>
            {t(typeBadgeKeys[mediaType])}
          </AdminBadge>
        )
      },
    },
    {
      accessorKey: 'size',
      header: t('common.labels.size'),
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {formatSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: 'folder',
      header: t('resources.media.table.folderHeader'),
      cell: ({ row }) => (
        <span className="bg-muted/60 text-muted-foreground rounded px-2 py-0.5 text-xs">
          {row.original.folder || t('resources.media.folders.ungrouped')}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t('resources.media.table.uploadedAtHeader'),
      cell: ({ row }) => {
        const d = row.original.createdAt
        return (
          <span className="text-muted-foreground font-mono text-xs">
            {d ? d.slice(0, 10) : '-'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-right">{t('common.labels.actions')}</div>
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleCopy(item)}
              className="hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded p-1.5 transition-colors"
              title={t('resources.media.table.copyUrl')}
            >
              {copiedId === item.id ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <ViewAction onClick={() => onSelectItem(item)} />
            <DeleteAction
              permission="media.delete"
              itemTitle={item.name}
              confirmDescription={t(
                'resources.media.table.deleteConfirmDescription',
                {
                  name: item.name,
                },
              )}
              onAction={() => onDeleteItem(item)}
            />
          </div>
        )
      },
    },
  ]

  return (
    <AdminTable
      columns={columns}
      data={data}
      loading={loading}
      searchKey="name"
      searchPlaceholder={t('resources.media.table.searchPlaceholder')}
    />
  )
}
