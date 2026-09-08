import { Trash2 } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { AdminAction, type AdminActionProps } from './admin-action'

export interface DeleteActionProps extends Omit<AdminActionProps, 'icon'> {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  itemTitle?: string
  children?: React.ReactNode
}

export function DeleteAction({
  label,
  icon = Trash2,
  children,
  variant = 'ghost',
  size = 'sm',
  itemTitle,
  confirmTitle,
  confirmDescription,
  ...props
}: DeleteActionProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.actions.delete')
  const resolvedConfirmTitle =
    confirmTitle ||
    (itemTitle
      ? t('common.confirm.deleteTitle', { title: itemTitle })
      : t('common.confirm.deleteItemTitle'))
  const resolvedConfirmDescription =
    confirmDescription || t('common.confirm.deleteDescription')
  return (
    <AdminAction
      icon={icon}
      variant={variant}
      size={size}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      confirm={true}
      confirmTitle={resolvedConfirmTitle}
      confirmDescription={resolvedConfirmDescription}
      confirmText={t('common.actions.confirmDelete')}
      {...props}
    >
      {children || resolvedLabel}
    </AdminAction>
  )
}
