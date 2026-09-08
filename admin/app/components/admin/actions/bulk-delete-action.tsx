import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { AdminConfirmDialog } from '../overlay/admin-confirm-dialog'

export interface BulkDeleteActionProps {
  selectedCount: number
  onConfirm: () => void | Promise<void>
  disabled?: boolean
  className?: string
}

export function BulkDeleteAction({
  selectedCount,
  onConfirm,
  disabled,
  className,
}: BulkDeleteActionProps) {
  const { t } = useTranslation()
  if (selectedCount <= 0) return null

  return (
    <AdminConfirmDialog
      title={t('common.confirm.bulkDeleteTitle', { count: selectedCount })}
      description={t('common.confirm.bulkDeleteDescription')}
      variant="destructive"
      confirmText={t('common.actions.confirmDelete')}
      onConfirm={onConfirm}
      trigger={
        <Button
          variant="destructive"
          size="sm"
          disabled={disabled}
          className={className}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common.actions.bulkDelete')} ({selectedCount})
        </Button>
      }
    />
  )
}
