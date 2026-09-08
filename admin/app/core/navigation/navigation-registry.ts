import type { NavGroup } from './navigation.types'

export class NavigationRegistry {
  private staticGroups: NavGroup[] = []

  registerGroup(group: NavGroup): void {
    const existing = this.staticGroups.find((g) => g.title === group.title)
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
      this.staticGroups.push({ ...group, items: [...group.items] })
    }
  }

  getGroups(): NavGroup[] {
    return this.staticGroups
  }

  clear(): void {
    this.staticGroups = []
  }
}

export const navigationRegistry = new NavigationRegistry()
