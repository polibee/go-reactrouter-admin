import type React from 'react'

export interface NavItem {
  title: string
  url?: string
  href?: string
  to?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  permission?: string
  isActive?: boolean
  items?: NavItem[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
  sort?: number
}

export interface NavigationConfig {
  groups: NavGroup[]
}
