import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminConfirmDialog } from '~/components/admin'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import type { MediaCategoryDef } from '../types'
import { MediaCategoryDialog } from './media-category-dialog'

export interface MediaCategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: MediaCategoryDef[]
  itemCounts: Record<string, number>
  onSave: (values: { id?: string; name: string; sort: number }) => Promise<void>
  onDelete: (category: MediaCategoryDef) => Promise<void>
}

export function MediaCategoryManager({
  open,
  onOpenChange,
  categories,
  itemCounts,
  onSave,
  onDelete,
}: MediaCategoryManagerProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState<MediaCategoryDef | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (category: MediaCategoryDef) => {
    setEditing(category)
    setDialogOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FolderTree className="text-primary size-4" />
            {t('resources.media.categories.title')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('resources.media.categories.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={handleCreate}
            >
              <Plus className="size-3.5" />
              {t('resources.media.categories.add')}
            </Button>
          </div>

          {categories.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">
              {t('resources.media.categories.empty')}
            </div>
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-0.5">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate text-xs font-medium">
                        {category.name}
                      </span>
                      <Badge variant="secondary" className="px-1.5 text-xs">
                        {t('resources.media.categories.count', {
                          count: itemCounts[category.name] ?? 0,
                        })}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground block text-xs">
                      {t('resources.media.categories.sortLabel')}:{' '}
                      {category.sort}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <AdminConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                      title={t('resources.media.categories.deleteTitle')}
                      description={t(
                        'resources.media.categories.deleteDescription',
                        { name: category.name },
                      )}
                      variant="destructive"
                      onConfirm={() => onDelete(category)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onOpenChange(false)}
          >
            {t('common.actions.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>

      <MediaCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSave={onSave}
      />
    </Dialog>
  )
}
