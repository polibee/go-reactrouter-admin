import { toast } from 'sonner'

export interface NotifyOptions {
  description?: React.ReactNode
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const notify = {
  success(message: string, options?: NotifyOptions) {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
    })
  },

  error(message: string, options?: NotifyOptions) {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    })
  },

  info(message: string, options?: NotifyOptions) {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
    })
  },

  warning(message: string, options?: NotifyOptions) {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 3500,
      action: options?.action,
    })
  },
}
