import type * as React from 'react'
import { Badge } from '~/components/ui/badge'

export type AdminBadgeProps = React.ComponentProps<typeof Badge> & {
  status?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

export function AdminBadge({
  status = 'default',
  className = '',
  ...props
}: AdminBadgeProps) {
  const getStatusClass = () => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      case 'warning':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
      case 'error':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
      case 'info':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20'
      default:
        return ''
    }
  }

  return (
    <Badge
      variant={status === 'default' ? props.variant || 'secondary' : 'outline'}
      className={`${getStatusClass()} ${className}`}
      {...props}
    />
  )
}
