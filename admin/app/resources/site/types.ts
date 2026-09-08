import { z } from 'zod'
import { i18n } from '~/core/i18n'

// ==========================================
// 1. 单页面 (SitePage)
// ==========================================
export interface SitePage {
  id: string
  title: string
  slug: string
  content: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  status: 'published' | 'draft'
  views: number
  createdAt: string
  updatedAt: string
  // Per-locale display-title overrides; falls back to `title` for missing locales
  nameTranslations?: Record<string, string>
}

export const sitePageFormSchema = z.object({
  title: z
    .string()
    .min(2, i18n.t('resources.site.validation.pageTitleMin', { count: 2 })),
  slug: z
    .string()
    .min(2, i18n.t('resources.site.validation.pageSlugMin', { count: 2 }))
    .regex(/^[a-zA-Z0-9_-]+$/, i18n.t('resources.site.validation.slugPattern')),
  content: z
    .string()
    .min(5, i18n.t('resources.site.validation.pageContentMin')),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  status: z.enum(['published', 'draft']).default('published'),
  nameTranslations: z.record(z.string(), z.string()).optional(),
})

export type SitePageFormValues = z.infer<typeof sitePageFormSchema>

// ==========================================
// 2. 导航分组与菜单 (SiteNavGroup & SiteNavItem)
// ==========================================
export type NavLocation = 'header' | 'footer'

export interface SiteNavGroup {
  id: string
  name: string // 分类/分组名字 (如 "核心产品", "法律合规", "产品服务")
  location: NavLocation // 'header' | 'footer'
  sort: number // 排序权重
  enabled: boolean // 启用状态
  description?: string // 分组描述
  nameTranslations?: Record<string, string> // 各语言显示名覆盖，缺省回落 name
}

export const siteNavGroupSchema = z.object({
  name: z.string().min(1, i18n.t('resources.site.validation.categoryNameMin')),
  location: z.enum(['header', 'footer']),
  sort: z.coerce.number().default(10),
  enabled: z.boolean().default(true),
  description: z.string().optional(),
  nameTranslations: z.record(z.string(), z.string()).optional(),
})

export type SiteNavGroupFormValues = z.infer<typeof siteNavGroupSchema>

export interface SiteNavItem {
  id: string
  location: NavLocation
  title: string
  url: string
  target: '_self' | '_blank'
  sort: number
  enabled: boolean
  groupId?: string // 所属分组 ID
  group?: string // 兼容历史分组名称
  parentId?: string // 父级菜单 ID (支持多级子菜单)
  description?: string // 描述/副标题 (富文本下拉菜单展现)
  children?: SiteNavItem[] // 树状展示时的子菜单列表
  nameTranslations?: Record<string, string> // 各语言显示名覆盖，缺省回落 title
}

export const siteNavItemSchema = z.object({
  location: z.enum(['header', 'footer']),
  title: z
    .string()
    .min(1, i18n.t('resources.site.validation.navTitleRequired')),
  url: z.string().default('#'),
  target: z.enum(['_self', '_blank']).default('_self'),
  sort: z.coerce.number().default(10),
  enabled: z.boolean().default(true),
  groupId: z.string().optional(),
  group: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
  nameTranslations: z.record(z.string(), z.string()).optional(),
})

export type SiteNavItemFormValues = z.infer<typeof siteNavItemSchema>

// ==========================================
// 3. 卡片小工具 (SiteWidgetConfig)
// ==========================================
export type WidgetPlacement =
  | 'dashboard'
  | 'home_sidebar'
  | 'page_sidebar'
  | 'site_sidebar'
  | 'both'
export type WidgetCardType =
  | 'preset'
  | 'image_banner'
  | 'link_list'
  | 'custom_html'
  | 'custom_js'
  | 'custom_text'

export interface SiteWidgetConfig {
  id: string
  key: string
  title: string
  description?: string
  placement: WidgetPlacement
  cardType?: WidgetCardType
  customContent?: string
  imageUrl?: string
  targetUrl?: string
  targetWindow?: '_self' | '_blank'
  linkItemsText?: string
  jsCode?: string
  enabled: boolean
  sort: number
  settings?: Record<string, unknown>
}

export const siteWidgetFormSchema = z.object({
  key: z
    .string()
    .min(2, i18n.t('resources.site.validation.widgetIdMin', { count: 2 }))
    .regex(/^[a-zA-Z0-9_-]+$/, i18n.t('resources.site.validation.slugPattern')),
  title: z
    .string()
    .min(2, i18n.t('resources.site.validation.widgetTitleMin', { count: 2 })),
  description: z.string().optional(),
  placement: z
    .enum(['dashboard', 'home_sidebar', 'page_sidebar', 'site_sidebar', 'both'])
    .default('both'),
  cardType: z
    .enum([
      'preset',
      'image_banner',
      'link_list',
      'custom_html',
      'custom_js',
      'custom_text',
    ])
    .default('preset'),
  customContent: z.string().optional(),
  imageUrl: z.string().optional(),
  targetUrl: z.string().optional(),
  targetWindow: z.enum(['_self', '_blank']).default('_blank'),
  linkItemsText: z.string().optional(),
  jsCode: z.string().optional(),
  enabled: z.boolean().default(true),
  sort: z.coerce.number().default(10),
})

export type SiteWidgetFormValues = z.infer<typeof siteWidgetFormSchema>

export interface SiteWidgetGlobalSettings {
  density: 'compact' | 'standard' // 侧边栏卡片密度: compact(紧凑微排版，推荐) | standard(标准)
  sidebarSticky: boolean // 侧边栏是否吸顶浮动
  showCardDividers: boolean // 卡片内部是否显示分割线
}

// ==========================================
// 4. 运营通知 (SiteAnnouncement)
// ==========================================
export type AnnouncementType = 'modal' | 'banner' | 'corner' | 'marquee'

export interface SiteAnnouncement {
  id: string
  type: AnnouncementType
  title: string
  content: string
  linkUrl?: string
  linkText?: string
  enabled: boolean
  showOnce?: boolean
  style?: 'default' | 'info' | 'warning' | 'destructive'
  updatedAt: string
}

export const siteAnnouncementSchema = z.object({
  type: z.enum(['modal', 'banner', 'corner', 'marquee']),
  title: z
    .string()
    .min(
      2,
      i18n.t('resources.site.validation.announcementTitleMin', { count: 2 }),
    ),
  content: z
    .string()
    .min(
      2,
      i18n.t('resources.site.validation.announcementContentMin', { count: 2 }),
    ),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
  enabled: z.boolean().default(true),
  showOnce: z.boolean().default(false),
  style: z.enum(['default', 'info', 'warning', 'destructive']).default('info'),
})

export type SiteAnnouncementFormValues = z.infer<typeof siteAnnouncementSchema>

// ==========================================
// 5. 广告位 (SiteAdSlot)
// ==========================================
export type AdType = 'image' | 'text' | 'html'

export interface SiteAdSlot {
  id: string
  slotKey: string
  title: string
  adType: AdType
  imageUrl?: string
  targetUrl?: string
  text?: string
  htmlContent?: string
  enabled: boolean
  updatedAt: string
}

export const siteAdSlotSchema = z.object({
  slotKey: z
    .string()
    .min(2, i18n.t('resources.site.validation.adSlotIdMin', { count: 2 }))
    .regex(/^[a-zA-Z0-9_-]+$/, i18n.t('resources.site.validation.slugPattern')),
  title: z
    .string()
    .min(2, i18n.t('resources.site.validation.adSlotTitleMin', { count: 2 })),
  adType: z.enum(['image', 'text', 'html']).default('image'),
  imageUrl: z.string().optional(),
  targetUrl: z.string().optional(),
  text: z.string().optional(),
  htmlContent: z.string().optional(),
  enabled: z.boolean().default(true),
})

export type SiteAdSlotFormValues = z.infer<typeof siteAdSlotSchema>

// ==========================================
// 6. 友情链接 (FriendLink)
// ==========================================
export type FriendLinkStatus = 'pending' | 'approved' | 'rejected'
export type BacklinkStatus =
  | 'verified'
  | 'missing'
  | 'checking'
  | 'failed'
  | 'unverified'

export interface FriendLink {
  id: string
  name: string
  url: string
  logo?: string
  description?: string
  email?: string
  status: FriendLinkStatus
  sort: number
  rejectReason?: string
  backlinkStatus?: BacklinkStatus
  lastCheckedAt?: string
  backlinkDetails?: string
  createdAt: string
  updatedAt: string
}

export const friendLinkFormSchema = z.object({
  name: z
    .string()
    .min(
      2,
      i18n.t('resources.site.validation.friendLinkNameMin', { count: 2 }),
    ),
  url: z
    .string()
    .url(i18n.t('resources.site.links.apply.validation.urlInvalid')),
  logo: z
    .string()
    .url(i18n.t('resources.site.links.apply.validation.logoUrlInvalid'))
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(
      200,
      i18n.t('resources.site.links.apply.validation.descriptionMaxLength', {
        count: 200,
      }),
    )
    .optional(),
  email: z
    .string()
    .email(i18n.t('resources.site.validation.friendLinkEmailInvalid'))
    .optional()
    .or(z.literal('')),
  sort: z.coerce.number().default(10),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  rejectReason: z.string().optional(),
})

export type FriendLinkFormValues = z.infer<typeof friendLinkFormSchema>

// ==========================================
// 7. 友链互换准则 (FriendLinkGuidelines)
// ==========================================
export interface FriendLinkGuidelines {
  title: string
  rule1Title: string
  rule1Desc: string
  rule2Title: string
  rule2Desc: string
  rule3Title: string
  rule3Desc: string
  customNotice?: string
  updatedAt: string
}

export const friendLinkGuidelinesSchema = z.object({
  title: z
    .string()
    .min(
      2,
      i18n.t('resources.site.validation.guidelinesTitleMin', { count: 2 }),
    ),
  rule1Title: z
    .string()
    .min(2, i18n.t('resources.site.validation.ruleTitleRequired')),
  rule1Desc: z
    .string()
    .min(5, i18n.t('resources.site.validation.ruleDescRequired')),
  rule2Title: z
    .string()
    .min(2, i18n.t('resources.site.validation.ruleTitleRequired')),
  rule2Desc: z
    .string()
    .min(5, i18n.t('resources.site.validation.ruleDescRequired')),
  rule3Title: z
    .string()
    .min(2, i18n.t('resources.site.validation.ruleTitleRequired')),
  rule3Desc: z
    .string()
    .min(5, i18n.t('resources.site.validation.ruleDescRequired')),
  customNotice: z.string().optional(),
})

export type FriendLinkGuidelinesFormValues = z.infer<
  typeof friendLinkGuidelinesSchema
>
