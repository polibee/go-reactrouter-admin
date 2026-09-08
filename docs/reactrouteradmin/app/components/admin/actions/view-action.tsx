import { Eye } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { AdminAction, type AdminActionProps } from './admin-action'

export interface ViewActionProps extends Omit<AdminActionProps, 'icon'> {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
}

export function ViewAction({
  label,
  icon = Eye,
  children,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ViewActionProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.actions.view')
  return (
    <AdminAction icon={icon} variant={variant} size={size} {...props}>
      {children || resolvedLabel}
    </AdminAction>
  )
}
