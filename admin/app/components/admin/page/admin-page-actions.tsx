import type React from 'react'

export interface AdminPageActionsProps {
  children: React.ReactNode
  className?: string
}

export function AdminPageActions({
  children,
  className = '',
}: AdminPageActionsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}
