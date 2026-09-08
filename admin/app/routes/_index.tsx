import {
  ArrowRight,
  FileText,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PublicSiteLayout } from '~/components/layout/public-site-layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { i18n } from '~/core/i18n'
import { siteService } from '~/resources/site/service'
import type {
  SiteAdSlot,
  SitePage,
  SiteWidgetGlobalSettings,
} from '~/resources/site/types'
import { WidgetRenderer } from '~/resources/site/widgets/components/widget-renderer'

export const meta = () => {
  return [
    { title: i18n.t('pages.home.meta.title') },
    {
      name: 'description',
      content: i18n.t('pages.home.meta.description'),
    },
  ]
}

export default function HomePage() {
  const { t } = useTranslation()
  const [headerAd, setHeaderAd] = useState<SiteAdSlot | null>(null)
  const [publishedPages, setPublishedPages] = useState<SitePage[]>([])
  const [globalSettings, setGlobalSettings] =
    useState<SiteWidgetGlobalSettings>(() =>
      siteService.getWidgetGlobalSettings(),
    )

  useEffect(() => {
    const load = async () => {
      const [hAd, pages] = await Promise.all([
        siteService.getActiveAdSlot('header_banner'),
        siteService.getPages(),
      ])
      setHeaderAd(hAd)
      setPublishedPages(pages.filter((p) => p.status === 'published'))
    }
    load()

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<SiteWidgetGlobalSettings>
      if (customEvent.detail) {
        setGlobalSettings(customEvent.detail)
      }
    }
    window.addEventListener(
      'site_widget_settings_changed',
      handleSettingsChange,
    )
    return () => {
      window.removeEventListener(
        'site_widget_settings_changed',
        handleSettingsChange,
      )
    }
  }, [])

  return (
    <PublicSiteLayout>
      <div className="space-y-10">
        {/* 1. 顶部通栏广告位 (Header Banner Ad) */}
        {headerAd && (
          <div className="from-primary/10 via-primary/5 to-accent flex flex-col justify-between gap-3 rounded-lg border bg-linear-to-r p-3.5 shadow-xs sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-primary/20 text-primary rounded px-1.5 py-0.5 text-xs font-bold">
                {t('pages.home.ad.badge')}
              </span>
              <span className="text-foreground font-medium">
                {headerAd.text || headerAd.title}
              </span>
            </div>
            {headerAd.targetUrl && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="h-7 shrink-0 self-start text-xs sm:self-center"
              >
                <Link to={headerAd.targetUrl}>
                  {t('pages.home.ad.learnMore')}
                  <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* 2. 主区 2 栏式布局：左侧核心内容 + 右侧吸顶固定小工具侧边栏 (Sticky Sidebar) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* 左侧 2 列：主门户内容 */}
          <div className="space-y-8 lg:col-span-2">
            {/* Hero Card */}
            <Card className="overflow-hidden border shadow-xs">
              <div className="from-primary/15 via-background to-background space-y-6 bg-linear-to-br p-6 sm:p-10">
                <div className="bg-primary/15 text-primary inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold">
                  <Sparkles className="size-3.5" />
                  {t('pages.home.hero.badge')}
                </div>
                <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
                  {t('pages.home.hero.title')}
                </h1>
                <p className="text-muted-foreground max-w-xl text-base leading-7">
                  {t('pages.home.hero.descriptionPrefix')}{' '}
                  <strong>{t('pages.home.hero.featurePages')}</strong>
                  {t('pages.home.hero.listSeparator')}
                  <strong>{t('pages.home.hero.featureNav')}</strong>
                  {t('pages.home.hero.listSeparator')}
                  <strong>{t('pages.home.hero.featureWidgets')}</strong>
                  {t('pages.home.hero.listAnd')}
                  <strong>{t('pages.home.hero.featureNotices')}</strong>
                  {t('pages.home.hero.descriptionSuffix')}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild size="sm">
                    <Link to="/admin/users">
                      {t('pages.home.hero.ctaAdmin')}
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/about">{t('pages.home.hero.ctaAbout')}</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/links">{t('pages.home.hero.ctaLinks')}</Link>
                  </Button>
                </div>
              </div>
            </Card>

            {/* 单页面直达区 */}
            <Card className="border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b p-4 pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="text-primary size-4" />
                    {t('pages.home.singlePages.title')}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {t('pages.home.singlePages.count', {
                    count: publishedPages.length,
                  })}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3">
                {publishedPages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/${page.slug}`}
                    className="bg-card hover:border-primary/50 group flex flex-col justify-between rounded-lg border p-3.5 transition-all hover:shadow-xs"
                  >
                    <div>
                      <div className="text-foreground group-hover:text-primary flex items-center justify-between text-xs font-medium transition-colors">
                        <span>{page.title}</span>
                      </div>
                      <div className="text-muted-foreground mt-1 font-mono text-xs">
                        /{page.slug}
                      </div>
                    </div>
                    <div className="text-primary mt-3 flex items-center gap-0.5 border-t pt-2 text-xs font-medium">
                      {t('pages.home.singlePages.readMore')}{' '}
                      <ArrowRight className="size-2.5" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* 核心架构特性卡片 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-card space-y-2 rounded-lg border p-4">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="text-xs font-semibold">
                  {t('pages.home.features.rbacTitle')}
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  {t('pages.home.features.rbacDescription')}
                </p>
              </div>

              <div className="bg-card space-y-2 rounded-lg border p-4">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
                  <Zap className="size-4" />
                </div>
                <h3 className="text-xs font-semibold">
                  {t('pages.home.features.componentsTitle')}
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  {t('pages.home.features.componentsDescription')}
                </p>
              </div>

              <div className="bg-card space-y-2 rounded-lg border p-4">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
                  <LayoutGrid className="size-4" />
                </div>
                <h3 className="text-xs font-semibold">
                  {t('pages.home.features.widgetsTitle')}
                </h3>
                <p className="text-muted-foreground text-xs leading-normal">
                  {t('pages.home.features.widgetsDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* 右侧 1 列：首页小工具侧边栏 (由全局设置控制是否 Sticky 吸顶) */}
          <div
            className={`lg:col-span-1 ${globalSettings.sidebarSticky ? 'sticky top-20' : ''}`}
          >
            <WidgetRenderer placement="home_sidebar" />
          </div>
        </div>
      </div>
    </PublicSiteLayout>
  )
}
