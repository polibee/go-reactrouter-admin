import type { AuthUser } from '~/core/auth/auth.types'
import { i18n } from '~/core/i18n'
import { hasPermission } from '~/core/permissions/permission.service'
import { resourceRegistry } from '~/core/registry/resource.registry'
import { navigationRegistry } from './navigation-registry'
import type { NavGroup, NavItem } from './navigation.types'

export function buildNavigation(user: AuthUser | null): NavGroup[] {
  // 1. Group map to collect items
  const groupMap = new Map<string, { sort: number; items: NavItem[] }>()

  // 2. Add static registered groups
  for (const staticGroup of navigationRegistry.getGroups()) {
    const existing = groupMap.get(staticGroup.title) || {
      sort: staticGroup.sort ?? 50,
      items: [],
    }
    const permittedItems = staticGroup.items.filter((item) =>
      hasPermission(user, item.permission),
    )
    existing.items.push(...permittedItems)
    groupMap.set(staticGroup.title, existing)
  }

  // 3. Collect from Resource Registry
  const resources = resourceRegistry.getAll()
  for (const resource of resources) {
    // Check if user has permission to view this resource
    const viewPermission = resource.permissions?.view
    if (viewPermission && !hasPermission(user, viewPermission)) {
      continue
    }

    if (typeof resource.navigation?.hidden === 'function') {
      if (resource.navigation.hidden()) continue
    } else if (resource.navigation?.hidden === true) {
      continue
    }

    const groupTitle =
      resource.navigation?.group || i18n.t('navigation.groups.resources')
    const groupSort = resource.navigation?.sort ?? 10
    const group = groupMap.get(groupTitle) || { sort: groupSort, items: [] }

    const navItem: NavItem = {
      title: resource.label,
      url: resource.routes?.listPath || `/admin/${resource.name}`,
      icon: resource.icon,
      permission: viewPermission,
      badge:
        typeof resource.navigation?.badge === 'function'
          ? resource.navigation.badge()
          : resource.navigation?.badge,
    }

    group.items.push(navItem)
    groupMap.set(groupTitle, group)
  }

  // 4. Transform and sort
  const result: NavGroup[] = []
  for (const [title, data] of groupMap.entries()) {
    if (data.items.length > 0) {
      result.push({
        title,
        sort: data.sort,
        items: data.items,
      })
    }
  }

  result.sort((a, b) => (a.sort ?? 50) - (b.sort ?? 50))
  return result
}
