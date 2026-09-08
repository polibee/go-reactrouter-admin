import {
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Search,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { mediaService } from '../service'
import type { MediaItem, MediaType } from '../types'

export interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: MediaItem) => void
  allowedTypes?: MediaType[] // default ['image']
  title?: string
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  allowedTypes = ['image'],
  title,
}: MediaPickerModalProps) {
  const { t } = useTranslation()
  const dialogTitle = title ?? t('resources.media.picker.title')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadMedia = async () => {
    setLoading(true)
    try {
      const list = await mediaService.getMediaList()
      const filtered = list.filter((i) => allowedTypes.includes(i.type))
      setItems(filtered)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload on open toggle only
  useEffect(() => {
    if (open) {
      loadMedia()
      setSelectedItem(null)
    }
  }, [open])

  const filteredItems = items.filter((i) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      i.name.toLowerCase().includes(q) ||
      i.tags?.some((t) => t.toLowerCase().includes(q))
    )
  })

  const handleConfirmSelect = () => {
    if (!selectedItem) return
    onSelect(selectedItem)
    onOpenChange(false)
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setUploading(true)
    try {
      const folderName = t('resources.media.picker.uploadFolder')
      const uploaded = await mediaService.uploadFile(file, folderName)
      onSelect(uploaded)
      onOpenChange(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="text-primary size-4" />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Tab 切换 */}
        <div className="flex items-center gap-2 border-b pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('resources.media.picker.libraryTab', { total: items.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('resources.media.picker.uploadTab')}
          </button>

          {activeTab === 'library' && (
            <div className="relative ml-auto w-48">
              <Search className="text-muted-foreground absolute top-1/2 left-2 size-3 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('resources.media.picker.searchPlaceholder')}
                className="bg-muted/20 h-7 pl-7 text-xs"
              />
            </div>
          )}
        </div>

        {/* Tab 1: 素材库网格选择 */}
        {activeTab === 'library' && (
          <div className="max-h-[420px] min-h-[300px] flex-1 overflow-y-auto p-1">
            {loading ? (
              <div className="text-muted-foreground flex h-48 items-center justify-center text-xs">
                <Loader2 className="text-primary mr-2 size-5 animate-spin" />
                <span>{t('resources.media.picker.loading')}</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-1 text-xs">
                <span>{t('resources.media.picker.emptyTitle')}</span>
                <span className="text-xs opacity-75">
                  {t('resources.media.picker.emptyHint')}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: media picker card, double-click to confirm selection
                    // biome-ignore lint/a11y/noStaticElementInteractions: media picker card, double-click to confirm selection
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => {
                        onSelect(item)
                        onOpenChange(false)
                      }}
                      className={`group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all ${
                        isSelected
                          ? 'ring-primary border-primary shadow-sm ring-2'
                          : 'hover:border-primary/60'
                      }`}
                    >
                      <div className="bg-muted/30 relative aspect-4/3 w-full overflow-hidden">
                        {item.type === 'image' ? (
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-primary flex h-full w-full items-center justify-center">
                            <FileText className="size-8" />
                          </div>
                        )}

                        {isSelected && (
                          <div className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full shadow-xs">
                            <Check className="size-3 stroke-3" />
                          </div>
                        )}
                      </div>
                      <div className="p-1.5">
                        <div
                          className="text-foreground truncate text-xs font-medium"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {item.dimensions
                            ? `${item.dimensions.width}×${item.dimensions.height}`
                            : `${Math.round(item.size / 1024)} KB`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 即时本地上传 */}
        {activeTab === 'upload' && (
          <div className="bg-muted/10 m-2 flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center">
            {uploading ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 text-xs">
                <Loader2 className="text-primary size-8 animate-spin" />
                <span>{t('resources.media.picker.uploading')}</span>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3">
                <input
                  type="file"
                  accept={
                    allowedTypes.includes('image') ? 'image/*' : undefined
                  }
                  onChange={handleDirectUpload}
                  className="hidden"
                />
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                  <UploadCloud className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-foreground text-xs font-semibold">
                    {t('resources.media.picker.dropzoneTitle')}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {t('resources.media.picker.dropzoneHint')}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="pointer-events-none mt-1 h-8 text-xs"
                >
                  {t('resources.media.picker.chooseFile')}
                </Button>
              </label>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between border-t pt-2 sm:justify-between">
          <div className="text-muted-foreground text-xs">
            {selectedItem ? (
              <span className="text-foreground inline-block max-w-[240px] truncate font-medium">
                {t('resources.media.picker.selected', {
                  name: selectedItem.name,
                })}
              </span>
            ) : (
              <span>{t('resources.media.picker.doubleClickHint')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSelect}
              disabled={!selectedItem || activeTab === 'upload'}
            >
              {t('resources.media.picker.insert')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
