import {
  Archive,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  File,
  FileText,
  HardDrive,
  Layers,
  Maximize2,
  Music,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { MediaItem } from '../types'

export interface MediaLinkFormat {
  key: 'direct' | 'markdown' | 'html' | 'bbcode'
  text: string
}

export function buildLinkFormats(
  item: MediaItem,
  fullUrl: string,
): MediaLinkFormat[] {
  if (item.type === 'image') {
    return [
      { key: 'direct', text: fullUrl },
      { key: 'markdown', text: `![${item.name}](${fullUrl})` },
      { key: 'html', text: `<img src="${fullUrl}" alt="${item.name}" />` },
      { key: 'bbcode', text: `[img]${fullUrl}[/img]` },
    ]
  }
  return [
    { key: 'direct', text: fullUrl },
    { key: 'markdown', text: `[${item.name}](${fullUrl})` },
    { key: 'html', text: `<a href="${fullUrl}">${item.name}</a>` },
    { key: 'bbcode', text: `[url=${fullUrl}]${item.name}[/url]` },
  ]
}

const FORMAT_LABEL_KEYS = {
  direct: 'resources.media.inspector.linkFormats.direct',
  markdown: 'resources.media.inspector.linkFormats.markdown',
  html: 'resources.media.inspector.linkFormats.html',
  bbcode: 'resources.media.inspector.linkFormats.bbcode',
} as const

export interface MediaInspectorProps {
  item: MediaItem | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, patch: Partial<MediaItem>) => void
  onDelete: (item: MediaItem) => void
  onCopyUrl: (url: string) => void
  fullUrl?: string
  onCopyText: (text: string) => void
}

export function MediaInspector({
  item,
  open,
  onClose,
  onUpdate,
  onDelete,
  onCopyUrl,
  fullUrl,
  onCopyText,
}: MediaInspectorProps) {
  const { t } = useTranslation()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')

  if (!open || !item) return null

  const resolvedFullUrl = fullUrl || item.url

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
  }

  const flashCopied = (key: string) => {
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleCopy = () => {
    onCopyUrl(item.url)
    flashCopied('url')
  }

  const handleCopyFormat = (format: MediaLinkFormat) => {
    if (format.key === 'direct') {
      onCopyUrl(item.url)
    } else {
      onCopyText(format.text)
    }
    flashCopied(format.key)
  }

  const handleStartRename = () => {
    setNameVal(item.name)
    setEditingName(true)
  }

  const handleSaveRename = () => {
    if (nameVal.trim() && nameVal.trim() !== item.name) {
      onUpdate(item.id, { name: nameVal.trim() })
    }
    setEditingName(false)
  }

  return (
    <div className="bg-background/95 animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l shadow-2xl backdrop-blur-md duration-200 sm:max-w-md">
      {/* 头部标题与关闭 */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">
            {t('resources.media.inspector.title')}
          </span>
          <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-xs uppercase">
            {item.type}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors"
          title={t('common.actions.close')}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* 资产高清预览区 */}
      <div className="bg-muted/20 flex max-h-[260px] min-h-[200px] items-center justify-center overflow-hidden border-b p-4">
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.name}
            className="bg-background max-h-[220px] max-w-full rounded-lg border object-contain shadow-xs"
          />
        ) : item.type === 'video' || item.mimeType.startsWith('video/') ? (
          // biome-ignore lint/a11y/useMediaCaption: user uploads have no caption assets
          <video
            src={resolvedFullUrl}
            controls
            preload="metadata"
            className="bg-background max-h-[220px] w-full rounded-lg border shadow-xs"
          />
        ) : item.mimeType.startsWith('audio/') ? (
          <div className="flex w-full flex-col items-center gap-2 py-4 text-purple-600 dark:text-purple-400">
            <Music className="size-12" />
            {/* biome-ignore lint/a11y/useMediaCaption: user uploads have no caption assets */}
            <audio
              src={resolvedFullUrl}
              controls
              preload="metadata"
              className="text-foreground w-full max-w-[280px]"
            />
            <span className="font-mono text-xs font-semibold">
              {t('resources.media.inspector.preview.audio')}
            </span>
          </div>
        ) : item.type === 'document' &&
          item.mimeType.includes('pdf') &&
          !item.url.startsWith('data:') ? (
          <iframe
            src={resolvedFullUrl}
            title={item.name}
            className="bg-background h-[220px] w-full rounded-lg border shadow-xs"
          />
        ) : item.type === 'document' ? (
          <div className="flex flex-col items-center gap-2 py-6 text-emerald-600 dark:text-emerald-400">
            <FileText className="size-16" />
            <span className="font-mono text-xs font-semibold">
              {t('resources.media.inspector.preview.document')}
            </span>
          </div>
        ) : item.type === 'archive' ? (
          <div className="flex flex-col items-center gap-2 py-6 text-amber-600 dark:text-amber-400">
            <Archive className="size-16" />
            <span className="font-mono text-xs font-semibold">
              {t('resources.media.inspector.preview.archive')}
            </span>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-6">
            <File className="size-16" />
            <span className="font-mono text-xs">
              {t('resources.media.inspector.preview.file')}
            </span>
          </div>
        )}
      </div>

      {/* 详细元数据列表 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
        {/* 文件名（支持就地修改） */}
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center justify-between font-medium">
            <span>{t('resources.media.inspector.nameLabel')}</span>
            {!editingName && (
              <button
                type="button"
                onClick={handleStartRename}
                className="text-primary cursor-pointer text-xs hover:underline"
              >
                {t('resources.media.inspector.rename')}
              </button>
            )}
          </div>
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                className="h-8 text-xs"
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={handleSaveRename}
              >
                <Check className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="text-foreground font-semibold break-all">
              {item.name}
            </div>
          )}
        </div>

        {/* 外链直达与快速复制 */}
        <div className="space-y-1">
          <div className="text-muted-foreground font-medium">
            {t('resources.media.inspector.urlLabel')}
          </div>
          <div className="flex items-center gap-1">
            <Input
              value={item.url}
              readOnly
              className="bg-muted/40 h-8 truncate font-mono text-xs select-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2.5"
              onClick={handleCopy}
              title={t('resources.media.inspector.copyLink')}
            >
              {copiedKey === 'url' ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* 多格式链接复制 (Markdown / HTML / BBCode) */}
        <div className="space-y-1.5 border-t pt-2">
          <div className="text-muted-foreground font-medium">
            {t('resources.media.inspector.linkFormats.title')}
          </div>
          {buildLinkFormats(item, resolvedFullUrl).map((format) => (
            <div key={format.key} className="space-y-0.5">
              <div className="text-muted-foreground/80 text-xs">
                {t(FORMAT_LABEL_KEYS[format.key])}
              </div>
              <div className="flex items-center gap-1">
                <Input
                  value={format.text}
                  readOnly
                  className="bg-muted/40 h-8 truncate font-mono text-xs select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-2.5"
                  onClick={() => handleCopyFormat(format)}
                  title={t('resources.media.inspector.copyLink')}
                >
                  {copiedKey === format.key ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 属性元信息网格 */}
        <div className="text-muted-foreground grid grid-cols-2 gap-3 border-t pt-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <HardDrive className="size-3" />
              <span>{t('resources.media.inspector.sizeLabel')}</span>
            </div>
            <div className="text-foreground font-mono font-medium">
              {formatSize(item.size)}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <Layers className="size-3" />
              <span>{t('resources.media.inspector.mimeLabel')}</span>
            </div>
            <div
              className="text-foreground truncate font-mono font-medium"
              title={item.mimeType}
            >
              {item.mimeType}
            </div>
          </div>

          {item.dimensions && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-xs">
                <Maximize2 className="size-3" />
                <span>{t('resources.media.inspector.dimensionsLabel')}</span>
              </div>
              <div className="text-foreground font-mono font-medium">
                {item.dimensions.width} × {item.dimensions.height} px
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="size-3" />
              <span>{t('resources.media.inspector.uploadedAtLabel')}</span>
            </div>
            <div className="text-foreground font-mono font-medium">
              {item.createdAt.slice(0, 10)}
            </div>
          </div>
        </div>

        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <div className="space-y-1.5 border-t pt-2">
            <div className="text-muted-foreground font-medium">
              {t('common.labels.tags')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作工具栏 */}
      <div className="bg-muted/20 flex items-center justify-between gap-2 border-t p-4">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8 cursor-pointer gap-1 text-xs"
          onClick={() => {
            onDelete(item)
            onClose()
          }}
        >
          <Trash2 className="size-3.5" />
          <span>{t('resources.media.inspector.deleteFile')}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            asChild
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              download={item.name}
            >
              <ExternalLink className="size-3.5" />
              <span>{t('resources.media.inspector.openInNewWindow')}</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
