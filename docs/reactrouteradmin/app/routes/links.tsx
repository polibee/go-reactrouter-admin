import {
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PublicSiteLayout } from '~/components/layout/public-site-layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { ApplyLinkDialog } from '~/resources/site/links/components/apply-link-dialog'
import { siteService } from '~/resources/site/service'
import type { FriendLink, FriendLinkGuidelines } from '~/resources/site/types'

export default function FriendLinksPage() {
  const { t } = useTranslation()
  const [links, setLinks] = useState<FriendLink[]>([])
  const [guidelines, setGuidelines] = useState<FriendLinkGuidelines | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [applyOpen, setApplyOpen] = useState(false)

  const loadLinks = async () => {
    setLoading(true)
    try {
      const [data, g] = await Promise.all([
        siteService.getApprovedFriendLinks(),
        siteService.getFriendLinkGuidelines(),
      ])
      setLinks(data)
      setGuidelines(g)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadLinks()
  }, [])

  return (
    <PublicSiteLayout>
      <div className="space-y-10">
        {/* 1. 页面 Hero 标头 */}
        <div className="from-primary/10 via-primary/5 to-background relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 shadow-xs sm:p-10">
          <div className="max-w-2xl space-y-3">
            <Badge
              variant="outline"
              className="bg-background/80 gap-1.5 px-3 py-1 text-xs"
            >
              <Link2 className="text-primary size-3.5" />
              {t('pages.links.hero.badge')}
            </Badge>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
              {t('pages.links.hero.title')}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('pages.links.hero.description')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => setApplyOpen(true)}
                className="h-9 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                {t('pages.links.hero.apply')}
              </Button>
              <Button variant="outline" asChild className="h-9 text-xs">
                <Link to="/">{t('pages.links.hero.backHome')}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. 伙伴链接卡片瀑布流网格 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
              <Globe className="text-primary size-4" />
              {t('pages.links.sites.title')}
            </h2>
            <span className="text-muted-foreground text-xs">
              {t('pages.links.sites.count', { count: links.length })}
            </span>
          </div>

          {loading ? (
            <div className="text-muted-foreground py-16 text-center text-xs">
              {t('pages.links.sites.loading')}
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground text-xs">
                {t('pages.links.sites.empty')}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApplyOpen(true)}
                className="mt-3 text-xs"
              >
                {t('pages.links.sites.emptyCta')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card className="hover:border-primary/50 group-hover:bg-muted/20 h-full border transition-all duration-200 hover:shadow-md">
                    <CardHeader className="space-y-2 p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-muted group-hover:border-primary/40 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors">
                            {link.logo ? (
                              <img
                                src={link.logo}
                                alt={link.name}
                                className="size-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Globe className="text-muted-foreground size-4" />
                            )}
                          </div>
                          <CardTitle className="group-hover:text-primary text-sm font-semibold transition-colors">
                            {link.name}
                          </CardTitle>
                        </div>
                        <ExternalLink className="text-muted-foreground group-hover:text-primary size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                        {link.description ||
                          t('pages.links.sites.fallbackDescription')}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 3. 友链交换规范指引 */}
        {guidelines && (
          <div className="bg-muted/30 space-y-4 rounded-xl border p-6">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="text-primary size-4" />
              {guidelines.title}
            </h3>
            <div className="text-muted-foreground grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-foreground flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  {guidelines.rule1Title}
                </div>
                <p className="pl-5 leading-relaxed whitespace-pre-wrap">
                  {guidelines.rule1Desc}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-foreground flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="text-primary size-3.5" />
                  {guidelines.rule2Title}
                </div>
                <p className="pl-5 leading-relaxed whitespace-pre-wrap">
                  {guidelines.rule2Desc}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-foreground flex items-center gap-1.5 font-medium">
                  <Zap className="size-3.5 text-amber-600" />
                  {guidelines.rule3Title}
                </div>
                <p className="pl-5 leading-relaxed whitespace-pre-wrap">
                  {guidelines.rule3Desc}
                </p>
              </div>
            </div>
            {guidelines.customNotice && (
              <div className="text-muted-foreground border-border/50 border-t pt-2 text-xs leading-relaxed">
                {guidelines.customNotice}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 访客申请弹窗 */}
      <ApplyLinkDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        onSuccess={loadLinks}
      />
    </PublicSiteLayout>
  )
}
