import {
  Archive,
  FileText,
  Film,
  HardDrive,
  Image as ImageIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MediaStorageStats } from '../types'

export interface MediaStorageStatsCardProps {
  stats: MediaStorageStats | null
  loading?: boolean
}

export function MediaStorageStatsCard({
  stats,
  loading,
}: MediaStorageStatsCardProps) {
  const { t } = useTranslation()
  if (loading || !stats) {
    return (
      <div className="bg-card/60 h-24 w-full animate-pulse rounded-xl border p-4" />
    )
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
  }

  const percentUsed = Math.min(
    100,
    Math.max(1, Math.round((stats.totalBytes / stats.maxBytes) * 100)),
  )

  const imagePct = (stats.byType.image.bytes / (stats.totalBytes || 1)) * 100
  const docPct = (stats.byType.document.bytes / (stats.totalBytes || 1)) * 100
  const videoPct = (stats.byType.video.bytes / (stats.totalBytes || 1)) * 100
  const archivePct =
    (stats.byType.archive.bytes / (stats.totalBytes || 1)) * 100

  return (
    <div className="bg-card space-y-3 rounded-xl border p-4 shadow-xs">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <HardDrive className="size-4" />
          </div>
          <div>
            <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
              <span>{t('resources.media.stats.quotaTitle')}</span>
              <span className="text-muted-foreground text-xs font-normal">
                (
                {t('resources.media.stats.usedPercent', {
                  percent: percentUsed,
                })}
                )
              </span>
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              {t('resources.media.stats.summary', {
                used: formatSize(stats.totalBytes),
                max: formatSize(stats.maxBytes),
                total: stats.totalCount,
              })}
            </div>
          </div>
        </div>

        {/* 分类小徽标 */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue-500" />
            <ImageIcon className="size-3 text-blue-500" />
            <span>
              {t('resources.media.stats.byType.image', {
                total: stats.byType.image.count,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <FileText className="size-3 text-emerald-500" />
            <span>
              {t('resources.media.stats.byType.document', {
                total: stats.byType.document.count,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-purple-500" />
            <Film className="size-3 text-purple-500" />
            <span>
              {t('resources.media.stats.byType.video', {
                total: stats.byType.video.count,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            <Archive className="size-3 text-amber-500" />
            <span>
              {t('resources.media.stats.byType.archive', {
                total: stats.byType.archive.count,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 彩色多段进度条 */}
      <div className="bg-muted/60 flex h-2 w-full overflow-hidden rounded-full">
        <div
          style={{ width: `${(imagePct * percentUsed) / 100}%` }}
          className="h-full bg-blue-500 transition-all"
          title={t('resources.media.stats.imageBytes', {
            size: formatSize(stats.byType.image.bytes),
          })}
        />
        <div
          style={{ width: `${(docPct * percentUsed) / 100}%` }}
          className="h-full bg-emerald-500 transition-all"
          title={t('resources.media.stats.documentBytes', {
            size: formatSize(stats.byType.document.bytes),
          })}
        />
        <div
          style={{ width: `${(videoPct * percentUsed) / 100}%` }}
          className="h-full bg-purple-500 transition-all"
          title={t('resources.media.stats.videoBytes', {
            size: formatSize(stats.byType.video.bytes),
          })}
        />
        <div
          style={{ width: `${(archivePct * percentUsed) / 100}%` }}
          className="h-full bg-amber-500 transition-all"
          title={t('resources.media.stats.archiveBytes', {
            size: formatSize(stats.byType.archive.bytes),
          })}
        />
      </div>
    </div>
  )
}
