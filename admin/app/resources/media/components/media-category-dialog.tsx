import { FolderTree } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { MediaCategoryDef } from '../types'

export interface MediaCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: MediaCategoryDef | null
  onSave: (values: { id?: string; name: string; sort: number }) => Promise<void>
}

export function MediaCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: MediaCategoryDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(category)
  const [name, setName] = useState('')
  const [sort, setSort] = useState(10)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync state when the edited category changes
  useEffect(() => {
    if (category) {
      setName(category.name)
      setSort(category.sort)
    } else {
      setName('')
      setSort(10)
    }
    setError('')
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError(t('resources.media.validation.categoryNameMin'))
      return
    }

    setSubmitting(true)
    try {
      await onSave({ id: category?.id, name: trimmed, sort: Number(sort) })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FolderTree className="text-primary size-4" />
            {isEditing
              ? t('resources.media.categories.editTitle')
              : t('resources.media.categories.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('resources.media.categories.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="media-category-name" className="text-xs">
              {t('resources.media.categories.nameLabel')}
            </Label>
            <Input
              id="media-category-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder={t('resources.media.categories.namePlaceholder')}
              className="h-8 text-xs"
              required
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="media-category-sort" className="text-xs">
              {t('resources.media.categories.sortLabel')}
            </Label>
            <Input
              id="media-category-sort"
              type="number"
              min={0}
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              className="h-8 text-xs"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={submitting || !name.trim()}
            >
              {submitting
                ? t('common.actions.saving')
                : t('common.actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
