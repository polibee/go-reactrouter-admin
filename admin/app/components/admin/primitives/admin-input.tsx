import React from 'react'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

export interface AdminInputProps extends React.ComponentProps<'input'> {
  error?: string
  leftIcon?: React.ComponentType<{ className?: string }>
  rightIcon?: React.ComponentType<{ className?: string }>
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (
    { className, error, leftIcon: LeftIcon, rightIcon: RightIcon, ...props },
    ref,
  ) => {
    if (LeftIcon || RightIcon) {
      return (
        <div className="relative flex w-full items-center">
          {LeftIcon && (
            <div className="text-muted-foreground pointer-events-none absolute left-3">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              LeftIcon && 'pl-9',
              RightIcon && 'pr-9',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            {...props}
          />
          {RightIcon && (
            <div className="text-muted-foreground pointer-events-none absolute right-3">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      )
    }

    return (
      <Input
        ref={ref}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        {...props}
      />
    )
  },
)

AdminInput.displayName = 'AdminInput'
