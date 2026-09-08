import type React from 'react'

export interface PageToolbarProps {
  children?: React.ReactNode
  className?: string
}

export function PageToolbar({ children, className = '' }: PageToolbarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}
