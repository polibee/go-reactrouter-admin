import type { NavGroup } from './navigation.types'

export class NavigationRegistry {
  private groupsByOwner = new Map<string, NavGroup[]>()

  registerGroup(group: NavGroup, owner = 'core'): void {
    const groups = this.groupsByOwner.get(owner) ?? []
    const existing = groups.find((g) => g.title === group.title)
    if (existing) {
      for (const item of group.items) {
        const duplicated = existing.items.some(
          (candidate) =>
            candidate.title === item.title &&
            (candidate.url ?? candidate.href ?? candidate.to) ===
              (item.url ?? item.href ?? item.to),
        )
        if (!duplicated) existing.items.push(item)
      }
    } else {
      groups.push({ ...group, items: [...group.items] })
    }
    this.groupsByOwner.set(owner, groups)
  }

  getGroups(): NavGroup[] {
    return Array.from(this.groupsByOwner.values()).flat()
  }

  unregisterOwner(owner: string): void {
    this.groupsByOwner.delete(owner)
  }

  clear(): void {
    this.groupsByOwner.clear()
  }
}

export const navigationRegistry = new NavigationRegistry()
