import { AdminConfirmDialog } from '../overlay/admin-confirm-dialog'
import { AdminButton, type AdminButtonProps } from '../primitives/admin-button'

export interface AdminActionProps extends AdminButtonProps {
  confirm?: boolean
  confirmTitle?: string
  confirmDescription?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onAction?: () => void | Promise<void>
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
}

export function AdminAction({
  confirm = false,
  confirmTitle,
  confirmDescription,
  confirmText,
  cancelText,
  onAction,
  onClick,
  ...props
}: AdminActionProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirm) {
      // Handled by ConfirmDialog trigger
      return
    }
    if (onAction) {
      onAction()
    }
    if (onClick) {
      onClick(e)
    }
  }

  if (confirm && onAction) {
    return (
      <AdminConfirmDialog
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={props.variant === 'destructive' ? 'destructive' : 'default'}
        onConfirm={onAction}
        trigger={
          <AdminButton
            {...props}
            onClick={(e) => {
              if (onClick) onClick(e)
            }}
          />
        }
      />
    )
  }

  return <AdminButton {...props} onClick={handleClick} />
}
