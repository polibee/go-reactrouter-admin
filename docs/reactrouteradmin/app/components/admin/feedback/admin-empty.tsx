import { Inbox } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

export interface AdminEmptyProps {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AdminEmpty({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: AdminEmptyProps) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('common.messages.noData')
  const resolvedDescription =
    description ?? t('common.messages.noDataDescription')
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-foreground mt-4 text-base font-semibold">
        {resolvedTitle}
      </h3>
      {description && (
        <p className="text-muted-foreground mt-1 text-sm">
          {resolvedDescription}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
