import { useState } from 'react'
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
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import type { FriendLink } from '../../types'

export interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: FriendLink | null
  onConfirm: (reason: string) => Promise<void>
  loading?: boolean
}

export function RejectDialog({
  open,
  onOpenChange,
  link,
  onConfirm,
  loading = false,
}: RejectDialogProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')

  const handleConfirm = async () => {
    await onConfirm(reason)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('resources.site.links.reject.title')}</DialogTitle>
          <DialogDescription>
            {t('resources.site.links.reject.description', { name: link?.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="reject-reason" className="text-xs">
            {t('resources.site.links.reject.reasonLabel')}
          </Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('resources.site.links.reject.reasonPlaceholder')}
            rows={3}
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? t('common.actions.processing')
              : t('resources.site.links.reject.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
