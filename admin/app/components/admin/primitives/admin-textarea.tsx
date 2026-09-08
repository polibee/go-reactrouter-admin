import React from 'react'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

export interface AdminTextareaProps extends React.ComponentProps<'textarea'> {
  error?: string
}

export const AdminTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AdminTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        error && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  )
})

AdminTextarea.displayName = 'AdminTextarea'
