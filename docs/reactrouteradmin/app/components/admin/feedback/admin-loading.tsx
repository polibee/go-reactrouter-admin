import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface AdminLoadingProps {
  text?: string
  className?: string
  fullPage?: boolean
}

export function AdminLoading({
  text,
  className = '',
  fullPage = false,
}: AdminLoadingProps) {
  const { t } = useTranslation()
  const resolvedText = text ?? t('common.actions.loading')
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}
    >
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      {text && <p className="text-muted-foreground text-sm">{resolvedText}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
        {content}
      </div>
    )
  }

  return content
}
