import { Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { AdminButton } from '../primitives/admin-button'

export interface FormActionsProps {
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  loading?: boolean
  submitIcon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
  className?: string
}

export function FormActions({
  submitText,
  cancelText,
  onCancel,
  loading = false,
  submitIcon = Save,
  children,
  className,
}: FormActionsProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn('mt-6 flex items-center gap-3 border-t pt-4', className)}
    >
      {children}
      <AdminButton type="submit" loading={loading} icon={submitIcon}>
        {submitText ?? t('common.actions.save')}
      </AdminButton>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelText ?? t('common.actions.cancel')}
        </Button>
      )}
    </div>
  )
}
