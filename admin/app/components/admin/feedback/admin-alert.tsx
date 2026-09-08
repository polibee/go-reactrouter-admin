import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type React from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export interface AdminAlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}

export function AdminAlert({
  type = 'info',
  title,
  children,
  className,
}: AdminAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'error':
        return <AlertCircle className="text-destructive h-4 w-4" />
      default:
        return <Info className="text-primary h-4 w-4" />
    }
  }

  const getVariant = () => {
    return type === 'error' ? 'destructive' : 'default'
  }

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
