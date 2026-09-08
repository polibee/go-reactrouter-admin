import type React from 'react'

export interface AdminPageContentProps {
  children: React.ReactNode
  className?: string
}

export function AdminPageContent({
  children,
  className = '',
}: AdminPageContentProps) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
}
