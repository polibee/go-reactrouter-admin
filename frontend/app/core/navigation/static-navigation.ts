import { sidebarData } from '~/data/sidebar-data'
import { navigationRegistry } from './navigation-registry'
import type { NavItem as RegistryNavItem } from './navigation.types'

let staticNavigationRegistered = false

export function registerStaticNavigation(): void {
  if (staticNavigationRegistered) return
  staticNavigationRegistered = true

  for (const group of sidebarData.navGroups) {
    navigationRegistry.registerGroup({
      title: group.title,
      items: group.items as unknown as RegistryNavItem[],
    })
  }
}
