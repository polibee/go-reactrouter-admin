import type React from 'react'

export interface AdminPageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  actions,
  children,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  )
}
