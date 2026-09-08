import { Edit2 } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { AdminAction, type AdminActionProps } from './admin-action'

export interface EditActionProps extends Omit<AdminActionProps, 'icon'> {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
}

export function EditAction({
  label,
  icon = Edit2,
  children,
  variant = 'outline',
  size = 'sm',
  ...props
}: EditActionProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.actions.edit')
  return (
    <AdminAction icon={icon} variant={variant} size={size} {...props}>
      {children || resolvedLabel}
    </AdminAction>
  )
}
