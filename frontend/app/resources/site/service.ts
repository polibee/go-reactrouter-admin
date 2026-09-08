// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import { i18n } from '~/core/i18n'
import { siteRepository, type SiteRepository } from './repository'
import type {
  FriendLink,
  FriendLinkFormValues,
  FriendLinkGuidelines,
  FriendLinkStatus,
  SiteAdSlot,
  SiteAdSlotFormValues,
  SiteAnnouncement,
  SiteAnnouncementFormValues,
  SiteNavGroup,
  SiteNavGroupFormValues,
  SiteNavItem,
  SiteNavItemFormValues,
  SitePage,
  SitePageFormValues,
  SiteWidgetConfig,
  SiteWidgetFormValues,
  SiteWidgetGlobalSettings,
} from './types'

export class SiteService {
  constructor(private repo: SiteRepository = siteRepository) {}

  // ==========================================
  // 1. Pages
  // ==========================================
  async getPages(): Promise<SitePage[]> {
    return this.repo.getPages()
  }

  async getPageById(id: string): Promise<SitePage | null> {
    return this.repo.getPageById(id)
  }

  async getPageBySlug(
    slug: string,
    recordView = false,
  ): Promise<SitePage | null> {
    const page = await this.repo.getPageBySlug(slug)
    if (page && recordView && page.status === 'published') {
      await this.repo.incrementPageViews(slug)
    }
    return page
  }

  async createPage(values: SitePageFormValues): Promise<SitePage> {
    const existing = await this.repo.getPageBySlug(values.slug)
    if (existing) {
      throw new Error(
        i18n.t('resources.site.pages.errors.slugTaken', { slug: values.slug }),
      )
    }

    return this.repo.savePage(values)
  }

  async updatePage(id: string, values: SitePageFormValues): Promise<SitePage> {
    const target = await this.repo.getPageById(id)
    if (!target) throw new Error(i18n.t('resources.site.pages.errors.notFound'))

    if (values.slug !== target.slug) {
      const existing = await this.repo.getPageBySlug(values.slug)
      if (existing && existing.id !== id) {
        throw new Error(
          i18n.t('resources.site.pages.errors.slugInUse', {
            slug: values.slug,
          }),
        )
      }
    }

    return this.repo.savePage({ ...values, id })
  }

  async deletePage(id: string): Promise<boolean> {
    return this.repo.deletePage(id)
  }

  // ==========================================
  // 2. Navigation Groups & Items
  // ==========================================
  async getNavGroups(location?: 'header' | 'footer'): Promise<SiteNavGroup[]> {
    return this.repo.getNavGroups(location)
  }

  async saveNavGroup(
    group: SiteNavGroupFormValues & { id?: string },
  ): Promise<SiteNavGroup> {
    return this.repo.saveNavGroup(group)
  }

  async deleteNavGroup(id: string): Promise<boolean> {
    return this.repo.deleteNavGroup(id)
  }

  async updateNavGroupSort(id: string, sort: number): Promise<SiteNavGroup> {
    return this.repo.updateNavGroupSort(id, sort)
  }

  async getHeaderNav(): Promise<SiteNavItem[]> {
    const tree = await this.repo.getNavTree('header')
    return tree
      .filter((i) => i.enabled)
      .map((item) => ({
        ...item,
        children: item.children ? item.children.filter((c) => c.enabled) : [],
      }))
  }

  async getFooterNav(): Promise<SiteNavItem[]> {
    const items = await this.repo.getNavItems('footer')
    return items.filter((i) => i.enabled)
  }

  async getNavTree(location?: 'header' | 'footer'): Promise<SiteNavItem[]> {
    return this.repo.getNavTree(location)
  }

  async getAllNavItems(location?: 'header' | 'footer'): Promise<SiteNavItem[]> {
    return this.repo.getNavItems(location)
  }

  async saveNavItem(
    item: SiteNavItemFormValues & { id?: string },
  ): Promise<SiteNavItem> {
    return this.repo.saveNavItem(item)
  }

  async deleteNavItem(id: string): Promise<boolean> {
    return this.repo.deleteNavItem(id)
  }

  // ==========================================
  // 3. Widgets
  // ==========================================
  async getWidgets(): Promise<SiteWidgetConfig[]> {
    return this.repo.getWidgets()
  }

  async getWidgetsForPlacement(
    placement: 'dashboard' | 'home_sidebar' | 'page_sidebar' | 'site_sidebar',
  ): Promise<SiteWidgetConfig[]> {
    const all = await this.repo.getWidgets()
    return all
      .filter((w) => {
        if (!w.enabled) return false
        if (w.placement === 'both') return true
        if (placement === 'home_sidebar') {
          return (
            w.placement === 'home_sidebar' || w.placement === 'site_sidebar'
          )
        }
        if (placement === 'page_sidebar') {
          return (
            w.placement === 'page_sidebar' || w.placement === 'site_sidebar'
          )
        }
        if (placement === 'site_sidebar') {
          return (
            w.placement === 'home_sidebar' ||
            w.placement === 'page_sidebar' ||
            w.placement === 'site_sidebar'
          )
        }
        if (placement === 'dashboard') {
          return w.placement === 'dashboard'
        }
        return w.placement === placement
      })
      .sort((a, b) => a.sort - b.sort)
  }

  async saveWidget(
    data: SiteWidgetFormValues & { id?: string },
  ): Promise<SiteWidgetConfig> {
    return this.repo.saveWidget(data)
  }

  async toggleWidget(id: string, enabled: boolean): Promise<SiteWidgetConfig> {
    return this.repo.updateWidget(id, { enabled })
  }

  async updateWidgetSort(id: string, sort: number): Promise<SiteWidgetConfig> {
    return this.repo.updateWidget(id, { sort })
  }

  async deleteWidget(id: string): Promise<boolean> {
    return this.repo.deleteWidget(id)
  }

  getWidgetGlobalSettings(): SiteWidgetGlobalSettings {
    return this.repo.getWidgetGlobalSettings()
  }

  saveWidgetGlobalSettings(
    settings: Partial<SiteWidgetGlobalSettings>,
  ): SiteWidgetGlobalSettings {
    return this.repo.saveWidgetGlobalSettings(settings)
  }

  // ==========================================
  // 4. Announcements
  // ==========================================
  async getAnnouncements(): Promise<SiteAnnouncement[]> {
    return this.repo.getAnnouncements()
  }

  async getActiveAnnouncements(): Promise<SiteAnnouncement[]> {
    const list = await this.repo.getAnnouncements()
    return list.filter((a) => a.enabled)
  }

  async saveAnnouncement(
    data: SiteAnnouncementFormValues & { id?: string },
  ): Promise<SiteAnnouncement> {
    return this.repo.saveAnnouncement(data)
  }

  async updateAnnouncement(
    id: string,
    data: Partial<SiteAnnouncement>,
  ): Promise<SiteAnnouncement> {
    return this.repo.updateAnnouncement(id, data)
  }

  async toggleAnnouncement(
    id: string,
    enabled: boolean,
  ): Promise<SiteAnnouncement> {
    return this.repo.updateAnnouncement(id, { enabled })
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.repo.deleteAnnouncement(id)
  }

  // ==========================================
  // 5. Ad Slots
  // ==========================================
  async getAdSlots(): Promise<SiteAdSlot[]> {
    return this.repo.getAdSlots()
  }

  async getActiveAdSlot(slotKey: string): Promise<SiteAdSlot | null> {
    const ads = await this.repo.getAdSlots()
    const target = ads.find((a) => a.slotKey === slotKey && a.enabled)
    return target || null
  }

  async saveAdSlot(
    data: SiteAdSlotFormValues & { id?: string },
  ): Promise<SiteAdSlot> {
    return this.repo.saveAdSlot(data)
  }

  async updateAdSlot(
    id: string,
    data: Partial<SiteAdSlot>,
  ): Promise<SiteAdSlot> {
    return this.repo.updateAdSlot(id, data)
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    return this.repo.deleteAdSlot(id)
  }

  // ==========================================
  // 6. Friend Links (友情链接)
  // ==========================================
  async getFriendLinks(status?: FriendLinkStatus): Promise<FriendLink[]> {
    return this.repo.getFriendLinks(status)
  }

  async getApprovedFriendLinks(): Promise<FriendLink[]> {
    return this.repo.getApprovedFriendLinks()
  }

  async saveFriendLink(
    data: FriendLinkFormValues & { id?: string },
  ): Promise<FriendLink> {
    return this.repo.saveFriendLink(data)
  }

  async applyFriendLink(data: {
    name: string
    url: string
    logo?: string
    description?: string
    email?: string
  }): Promise<FriendLink> {
    return this.repo.saveFriendLink({
      ...data,
      status: 'pending',
      sort: 50,
    })
  }

  async approveFriendLink(id: string): Promise<FriendLink> {
    return this.repo.updateFriendLinkStatus(id, 'approved')
  }

  async rejectFriendLink(id: string, reason?: string): Promise<FriendLink> {
    return this.repo.updateFriendLinkStatus(id, 'rejected', reason)
  }

  async deleteFriendLink(id: string): Promise<boolean> {
    return this.repo.deleteFriendLink(id)
  }

  async verifyFriendLink(id: string): Promise<FriendLink> {
    return this.repo.verifyFriendLink(id)
  }

  async verifyAllFriendLinks(): Promise<{
    total: number
    verified: number
    missing: number
    failed: number
  }> {
    return this.repo.verifyAllFriendLinks()
  }

  getWeeklyLinkCheckStatus(): {
    needsCheck: boolean
    lastCheckedAt: string | null
  } {
    if (typeof window === 'undefined')
      return { needsCheck: false, lastCheckedAt: null }
    const lastChecked = localStorage.getItem('site_last_weekly_link_check')
    if (!lastChecked) {
      return { needsCheck: true, lastCheckedAt: null }
    }
    const elapsed = Date.now() - new Date(lastChecked).getTime()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    return {
      needsCheck: elapsed > oneWeekMs,
      lastCheckedAt: lastChecked,
    }
  }

  // ==========================================
  // 7. Friend Link Guidelines
  // ==========================================
  async getFriendLinkGuidelines(): Promise<FriendLinkGuidelines> {
    return this.repo.getFriendLinkGuidelines()
  }

  async updateFriendLinkGuidelines(
    data: Partial<FriendLinkGuidelines>,
  ): Promise<FriendLinkGuidelines> {
    return this.repo.updateFriendLinkGuidelines(data)
  }
}

export const siteService = new SiteService()
