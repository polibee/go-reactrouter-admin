import { ArrowLeft, Clock, Eye, FileText, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PublicSiteLayout } from '~/components/layout/public-site-layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { localizedName } from '~/resources/site/localize'
import { siteService } from '~/resources/site/service'
import type { SitePage, SiteWidgetGlobalSettings } from '~/resources/site/types'
import { WidgetRenderer } from '~/resources/site/widgets/components/widget-renderer'

export interface SinglePageViewProps {
  slug?: string
}

export function SinglePageView({ slug }: SinglePageViewProps) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState<SitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalSettings, setGlobalSettings] =
    useState<SiteWidgetGlobalSettings>(() =>
      siteService.getWidgetGlobalSettings(),
    )

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await siteService.getPageBySlug(slug, true)
        setPage(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  useEffect(() => {
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

  if (loading) {
    return (
      <PublicSiteLayout>
        <div className="text-muted-foreground flex flex-col items-center justify-center py-24 text-xs">
          <div className="border-primary mb-3 size-6 animate-spin rounded-full border-2 border-t-transparent" />
          <span>{t('pages.singlePage.loading')}</span>
        </div>
      </PublicSiteLayout>
    )
  }

  if (!page || page.status === 'draft') {
    return (
      <PublicSiteLayout>
        <div className="mx-auto max-w-md space-y-4 py-20 text-center">
          <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
            <FileText className="size-6" />
          </div>
          <h2 className="text-xl font-bold">
            {t('pages.singlePage.notFoundTitle')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('pages.singlePage.notFoundDescription')}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/">
                <Home className="mr-1 size-3.5" />
                {t('pages.singlePage.backHome')}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/pages">{t('pages.singlePage.goAdmin')}</Link>
            </Button>
          </div>
        </div>
      </PublicSiteLayout>
    )
  }

  // Check if content is HTML from WYSIWYG editor
  const isHtml = /<[a-z][\s\S]*>/i.test(page.content)
  const paragraphs = !isHtml ? page.content.split('\n\n') : []

  return (
    <PublicSiteLayout>
      <div className="space-y-4">
        {/* 面包屑导航 */}
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Link
            to="/"
            className="hover:text-foreground flex items-center gap-1"
          >
            <Home className="size-3" />
            {t('pages.singlePage.breadcrumbHome')}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {localizedName(page, i18n.language)}
          </span>
        </div>

        {/* 主区 2 栏式布局：左侧单页正文 + 右侧固定悬浮侧边栏 (Sticky Sidebar) */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* 左侧 2 列：单页面核心内容 */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border shadow-xs">
              <CardHeader className="border-b p-5 pb-4 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                      {localizedName(page, i18n.language)}
                    </CardTitle>
                    <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {t('pages.singlePage.updatedAt', {
                          date: page.updatedAt
                            ? page.updatedAt.slice(0, 10)
                            : '-',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {t('pages.singlePage.views', { views: page.views })}
                      </span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {t('pages.singlePage.slugLabel', { slug: page.slug })}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 self-start text-xs sm:self-center"
                  >
                    <Link to="/">
                      <ArrowLeft className="mr-1 size-3.5" />
                      {t('pages.singlePage.backHome')}
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                {isHtml ? (
                  <div
                    className="prose dark:prose-invert text-foreground/90 rich-text-rendered max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                ) : (
                  <div className="prose dark:prose-invert text-foreground/90 max-w-none space-y-4 text-sm leading-relaxed">
                    {paragraphs.map((p, idx) => {
                      if (p.startsWith('## ')) {
                        return (
                          <h2
                            key={idx}
                            className="text-foreground border-b pt-3 pb-1 text-lg font-bold"
                          >
                            {p.replace('## ', '')}
                          </h2>
                        )
                      }
                      if (p.startsWith('### ')) {
                        return (
                          <h3
                            key={idx}
                            className="text-foreground pt-2 text-base font-semibold"
                          >
                            {p.replace('### ', '')}
                          </h3>
                        )
                      }
                      if (p.startsWith('- ')) {
                        const items = p
                          .split('\n')
                          .map((line) => line.replace('- ', ''))
                        return (
                          <ul key={idx} className="list-disc space-y-1 pl-5">
                            {items.map((item, itemIdx) => (
                              <li key={itemIdx}>{item}</li>
                            ))}
                          </ul>
                        )
                      }
                      return (
                        <p key={idx} className="whitespace-pre-line">
                          {p}
                        </p>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧 1 列：单页侧边栏 (由全局设置控制是否 Sticky 吸顶) */}
          <div
            className={`lg:col-span-1 ${globalSettings.sidebarSticky ? 'sticky top-20' : ''}`}
          >
            {/* 紧凑版单页内容侧边栏小工具集合 (由后台统一纳管) */}
            <WidgetRenderer placement="page_sidebar" />
          </div>
        </div>
      </div>
    </PublicSiteLayout>
  )
}
