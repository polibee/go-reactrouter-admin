import type React from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'

export interface AdminConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: React.ReactNode
  content?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
  onConfirm: () => void | Promise<void>
  trigger?: React.ReactNode
  children?: React.ReactNode
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  confirmText,
  cancelText,
  variant = 'default',
  loading = false,
  onConfirm,
  trigger,
  children,
}: AdminConfirmDialogProps) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('common.confirm.defaultTitle')
  const resolvedConfirmText = confirmText ?? t('common.actions.confirm')
  const resolvedCancelText = cancelText ?? t('common.actions.cancel')
  const displayDescription =
    description ?? content ?? t('common.confirm.defaultDescription')
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{displayDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {resolvedCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              variant === 'destructive'
                ? buttonVariants({ variant: 'destructive' })
                : ''
            }
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
              if (onOpenChange) onOpenChange(false)
            }}
          >
            {loading ? t('common.actions.processing') : resolvedConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
