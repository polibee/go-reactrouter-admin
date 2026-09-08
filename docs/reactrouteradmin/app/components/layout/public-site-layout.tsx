import { ArrowRight, ChevronDown, ExternalLink, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ThemeSwitch } from '~/components/layout/theme-switch'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { localizedName } from '~/resources/site/localize'
import {
  BottomMarqueeNotice,
  OverlayNotices,
  TopBannerNotice,
} from '~/resources/site/operations/components/floating-notices'
import { siteService } from '~/resources/site/service'
import type { SiteNavGroup, SiteNavItem } from '~/resources/site/types'

export interface PublicSiteLayoutProps {
  children: React.ReactNode
}

export function PublicSiteLayout({ children }: PublicSiteLayoutProps) {
  const { t, i18n } = useTranslation()
  const [headerNav, setHeaderNav] = useState<SiteNavItem[]>([])
  const [footerNav, setFooterNav] = useState<SiteNavItem[]>([])
  const [footerGroups, setFooterGroups] = useState<SiteNavGroup[]>([])

  useEffect(() => {
    const loadNavs = async () => {
      try {
        const [h, f, fg] = await Promise.all([
          siteService.getHeaderNav(),
          siteService.getFooterNav(),
          siteService.getNavGroups('footer'),
        ])
        setHeaderNav(h)
        setFooterNav(f)
        setFooterGroups(fg.filter((g) => g.enabled))
      } catch (e) {
        console.error('Failed to load navigation in layout', e)
      }
    }
    loadNavs()
  }, [])

  // 动态组装页脚多列分类导航
  const footerSections = footerGroups.map((group) => ({
    id: group.id,
    title: localizedName(group, i18n.language),
    items: footerNav
      .filter((item) =>
        item.groupId ? item.groupId === group.id : item.group === group.name,
      )
      .sort((a, b) => a.sort - b.sort),
  }))

  // 兜底补齐未分配具体 groupId 的历史链接（如果有）
  const assignedItemIds = new Set(
    footerSections.flatMap((s) => s.items.map((i) => i.id)),
  )
  const unassignedItems = footerNav.filter(
    (item) => !assignedItemIds.has(item.id),
  )
  if (unassignedItems.length > 0) {
    footerSections.push({
      id: 'ungrouped',
      title: t('pages.layout.footer.ungroupedTitle'),
      items: unassignedItems.sort((a, b) => a.sort - b.sort),
    })
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* 1. 前台吸顶 Header：内置顶部运营通告条 + 导航栏，垂直流式排列，自然撑开文档流，绝对防遮挡 */}
      <header className="bg-background/90 sticky top-0 z-40 flex w-full flex-col border-b shadow-xs backdrop-blur-md transition-all">
        <TopBannerNotice />
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight"
            >
              <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg shadow-xs">
                <Shield className="size-4" />
              </div>
              <span>Admin Framework</span>
            </Link>

            {/* 现代化主菜单：支持普通单链与带子菜单的 Dropdown 下拉导航 */}
            <nav className="hidden items-center gap-1.5 text-sm font-medium md:flex">
              {headerNav.map((item) => {
                const hasChildren = item.children && item.children.length > 0

                if (hasChildren) {
                  return (
                    <DropdownMenu key={item.id}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 group flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-hidden"
                        >
                          <span>{localizedName(item, i18n.language)}</span>
                          <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-56 p-1.5 shadow-lg"
                      >
                        {(item.children ?? []).map((child) => (
                          <DropdownMenuItem
                            key={child.id}
                            asChild
                            className="cursor-pointer"
                          >
                            <Link
                              to={child.url}
                              target={child.target}
                              rel={
                                child.target === '_blank'
                                  ? 'noreferrer'
                                  : undefined
                              }
                              className="hover:bg-muted flex flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5"
                            >
                              <div className="flex w-full items-center justify-between">
                                <span className="text-foreground text-xs font-medium">
                                  {localizedName(child, i18n.language)}
                                </span>
                                {child.target === '_blank' && (
                                  <ExternalLink className="text-muted-foreground size-2.5" />
                                )}
                              </div>
                              {child.description && (
                                <span className="text-muted-foreground line-clamp-1 text-xs">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    to={item.url}
                    target={item.target}
                    rel={item.target === '_blank' ? 'noreferrer' : undefined}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors"
                  >
                    {localizedName(item, i18n.language)}
                    {item.target === '_blank' && (
                      <ExternalLink className="size-3" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <Button size="sm" asChild className="h-8 text-xs">
              <Link to="/admin">
                {t('pages.layout.header.adminCta')}
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. 运营浮层 (居中通知弹窗 / 右下角卡片，位置避让固定页脚) */}
      <OverlayNotices />

      {/* 3. 主页面内容 (由吸顶 Header 自然推开，pt-6 优雅呼吸感，防一切数据遮盖) */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-10">
        {children}
      </main>

      {/* 4. 经典现代化全宽页尾 (五列栅格布局，分类名字后台自由增删改) */}
      <footer className="bg-muted/20 text-foreground mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
            {/* 品牌定位与系统简介（占 2 列） */}
            <div className="col-span-2 space-y-4">
              <Link
                to="/"
                className="text-foreground flex items-center gap-2.5 text-base font-bold tracking-tight"
              >
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-xs">
                  <Shield className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight">React Admin Platform</span>
                  <span className="text-muted-foreground text-xs font-normal tracking-normal">
                    Enterprise Portal & Admin Engine
                  </span>
                </div>
              </Link>
              <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
                {t('pages.layout.footer.description')}
              </p>
              <div className="text-muted-foreground flex items-center gap-2 pt-1 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t('pages.layout.footer.statusOk')}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground font-mono text-xs">
                  v1.1.0
                </span>
              </div>
            </div>

            {/* 动态导航分组（由后台管理添加、修改、删除分类名字与子项） */}
            {footerSections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  {section.title}
                </h4>
                <ul className="text-muted-foreground space-y-2 text-xs">
                  {section.items.length === 0 ? (
                    <li className="text-muted-foreground/50 text-xs">
                      {t('pages.layout.footer.noLinks')}
                    </li>
                  ) : (
                    section.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.url}
                          target={item.target}
                          rel={
                            item.target === '_blank' ? 'noreferrer' : undefined
                          }
                          className="hover:text-primary inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{localizedName(item, i18n.language)}</span>
                          {item.target === '_blank' && (
                            <ExternalLink className="size-2.5 opacity-60" />
                          )}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* 底部版权与快捷辅助链接 */}
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row">
            <div>
              © {new Date().getFullYear()} React Admin Platform. All rights
              reserved.
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-muted-foreground/60 text-xs">
                Powered by React Router 8 &amp; Tailwind CSS
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-foreground cursor-pointer text-xs transition-colors"
              >
                {t('pages.layout.footer.backToTop')}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. 底部跑马灯通告 (严格位于页脚最下方流式呈现，通知在下，页脚导航在上) */}
      <BottomMarqueeNotice />
    </div>
  )
}
