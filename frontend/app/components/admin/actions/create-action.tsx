import { Plus } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { AdminAction, type AdminActionProps } from './admin-action'

export interface CreateActionProps extends Omit<AdminActionProps, 'icon'> {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
}

export function CreateAction({
  label,
  icon = Plus,
  children,
  ...props
}: CreateActionProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.actions.create')
  return (
    <AdminAction icon={icon} size="sm" {...props}>
      {children || resolvedLabel}
    </AdminAction>
  )
}
