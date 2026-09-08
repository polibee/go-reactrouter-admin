import { Trash2 } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { AdminConfirmDialog } from '../overlay/admin-confirm-dialog'

export interface AdminBulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete?: () => void | Promise<void>
  actions?: React.ReactNode
  deletePermission?: string
}

export function AdminBulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  actions,
}: AdminBulkActionsProps) {
  const { t } = useTranslation()
  if (selectedCount === 0) return null

  return (
    <div className="bg-muted/60 my-2 flex items-center justify-between rounded-lg border px-4 py-2.5">
      <div className="flex items-center space-x-2">
        <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-sm font-medium">
          {t('common.pagination.selectedItems')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground h-7 text-xs"
        >
          {t('common.actions.clearSelection')}
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {actions}

        {onBulkDelete && (
          <AdminConfirmDialog
            title={t('common.confirm.bulkDeleteTitle', {
              count: selectedCount,
            })}
            description={t('common.confirm.bulkDeleteIrreversible')}
            variant="destructive"
            confirmText={t('common.actions.confirmDelete')}
            onConfirm={onBulkDelete}
            trigger={
              <Button variant="destructive" size="sm" className="h-8">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.actions.bulkDelete')}
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
