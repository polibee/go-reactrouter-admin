import type React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export interface AdminCardProps extends Omit<
  React.ComponentProps<typeof Card>,
  'title'
> {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
}

export function AdminCard({
  title,
  description,
  action,
  footer,
  children,
  className,
  ...props
}: AdminCardProps) {
  return (
    <Card className={className} {...props}>
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

export {
  Card as BaseCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
