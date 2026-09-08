import { Check, File, Loader2, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notify } from '~/components/admin'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { mediaService } from '../service'
import type { MediaCategoryDef } from '../types'

export interface MediaUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: MediaCategoryDef[]
  onUploaded: () => void
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  categories,
  onUploaded,
}: MediaUploadDialogProps) {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [targetFolder, setTargetFolder] = useState('')
  const [customFolder, setCustomFolder] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
  }

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setProgress(10)

    try {
      const folder = customFolder.trim() || targetFolder || undefined

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        await mediaService.uploadFile(file, folder)
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      }

      notify.success(
        t('resources.media.upload.successToast', {
          total: selectedFiles.length,
        }),
      )
      setSelectedFiles([])
      setCustomFolder('')
      onUploaded()
      onOpenChange(false)
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.media.upload.failedToast'))
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <UploadCloud className="text-primary size-4" />
            {t('resources.media.upload.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* 拖拽放置区域 */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: upload dropzone, opens the file picker on click */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: upload dropzone, opens the file picker on click */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? 'border-primary bg-primary/5 scale-99'
                : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
              <UploadCloud className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-foreground text-xs font-semibold">
                {t('resources.media.upload.dropzoneTitle')}
              </div>
              <div className="text-muted-foreground text-xs">
                {t('resources.media.upload.dropzoneDescription')}
              </div>
            </div>
          </div>

          {/* 分组归类选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                {t('resources.media.upload.folderLabel')}
              </Label>
              <select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                className="border-input bg-background focus:ring-ring h-8 w-full rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
              >
                <option value="">
                  {t('resources.media.folders.ungrouped')}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {t('resources.media.upload.newFolderLabel')}
              </Label>
              <Input
                placeholder={t('resources.media.upload.newFolderPlaceholder')}
                value={customFolder}
                onChange={(e) => setCustomFolder(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* 待上传文件清单 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-between font-medium">
                <span>
                  {t('resources.media.upload.pendingList', {
                    total: selectedFiles.length,
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-destructive cursor-pointer text-xs hover:underline"
                >
                  {t('resources.media.upload.clearAll')}
                </button>
              </div>

              <div className="bg-muted/20 max-h-36 space-y-1.5 overflow-y-auto rounded-lg border p-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="bg-background flex items-center justify-between gap-2 rounded-md border p-1.5 text-xs"
                  >
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <File className="text-primary size-3.5 shrink-0" />
                      <span className="text-foreground truncate font-medium">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground shrink-0 font-mono text-xs">
                        ({formatSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上传进度条 */}
          {uploading && (
            <div className="space-y-1.5 pt-1">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{t('resources.media.upload.uploading')}</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  style={{ width: `${progress}%` }}
                  className="bg-primary h-full transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleUploadSubmit}
            disabled={selectedFiles.length === 0 || uploading}
            className="cursor-pointer gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>{t('resources.media.upload.uploading')}</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>
                  {t('resources.media.upload.startUpload', {
                    total: selectedFiles.length,
                  })}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
