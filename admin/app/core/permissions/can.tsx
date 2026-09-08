import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePermission } from './use-permission'

export interface CanProps {
  permission?: string
  fallback?: React.ReactNode
  children: React.ReactNode
  disableOnly?: boolean
}

export function Can({
  permission,
  fallback = null,
  children,
  disableOnly = false,
}: CanProps) {
  const { t } = useTranslation()
  const { hasPermission } = usePermission()
  const allowed = hasPermission(permission)

  if (!allowed) {
    if (disableOnly && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ disabled?: boolean; title?: string }>,
        {
          disabled: true,
          title: t('common.messages.unauthorized'),
        },
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}
