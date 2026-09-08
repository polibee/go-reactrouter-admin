import {
  ArrowRight,
  BellRing,
  Megaphone,
  Minus,
  Volume2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { siteService } from '../../service'
import type { SiteAnnouncement } from '../../types'

const DISMISS_PREFIX = 'site_announcement_dismissed_'

export function isNoticeDismissed24h(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const ts = localStorage.getItem(`${DISMISS_PREFIX}${id}`)
    if (!ts) return false
    const elapsed = Date.now() - Number(ts)
    return elapsed < 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function dismissNotice24h(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${id}`, String(Date.now()))
    window.dispatchEvent(
      new CustomEvent('site_notice_dismissed', { detail: id }),
    )
  } catch {
    // storage not available
  }
}

export interface FloatingNoticesProps {
  placement?: 'all' | 'banner' | 'overlays' | 'marquee'
}

export function FloatingNotices({ placement = 'all' }: FloatingNoticesProps) {
  const { t } = useTranslation()
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([])
  const [dismissedMap, setDismissedMap] = useState<Record<string, boolean>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<SiteAnnouncement | null>(null)
  const [cornerMinimized, setCornerMinimized] = useState(false)

  const loadData = useCallback(async () => {
    const active = await siteService.getActiveAnnouncements()
    setAnnouncements(active)

    // Build initial dismissed states from localStorage (24h rule)
    const dMap: Record<string, boolean> = {}
    for (const item of active) {
      if (isNoticeDismissed24h(item.id)) {
        dMap[item.id] = true
      }
    }
    setDismissedMap(dMap)

    // Check modal
    const modalAnn = active.find((a) => a.type === 'modal' && !dMap[a.id])
    if (modalAnn) {
      setActiveModal(modalAnn)
      setModalOpen(true)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleCustomDismiss = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setDismissedMap((prev) => ({ ...prev, [customEvent.detail]: true }))
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(DISMISS_PREFIX)) {
        const id = e.key.replace(DISMISS_PREFIX, '')
        setDismissedMap((prev) => ({ ...prev, [id]: true }))
      }
    }

    window.addEventListener('site_notice_dismissed', handleCustomDismiss)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('site_notice_dismissed', handleCustomDismiss)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadData])

  const handleDismissItem = (id: string) => {
    dismissNotice24h(id)
    setDismissedMap((prev) => ({ ...prev, [id]: true }))
  }

  const handleDismissModal = () => {
    setModalOpen(false)
    if (activeModal) {
      handleDismissItem(activeModal.id)
    }
  }

  const cleanUrl = (url?: string) => {
    if (!url) return ''
    return url.replace(/http:\/\/localhost:\d+/, '').replace('/p/', '/')
  }

  const bannerAnn = announcements.find(
    (a) => a.type === 'banner' && !dismissedMap[a.id],
  )
  const cornerAnn = announcements.find(
    (a) => a.type === 'corner' && !dismissedMap[a.id],
  )
  const marqueeAnn = announcements.find(
    (a) => a.type === 'marquee' && !dismissedMap[a.id],
  )

  const showBanner =
    (placement === 'all' || placement === 'banner') && bannerAnn
  const showOverlays = placement === 'all' || placement === 'overlays'
  const showMarquee =
    (placement === 'all' || placement === 'marquee') && marqueeAnn

  return (
    <>
      {/* 1. 顶部通告条 Banner (嵌入 Header 顶端，自然流式排列，绝对防遮挡) */}
      {showBanner && bannerAnn && (
        <div className="bg-primary text-primary-foreground border-primary-foreground/10 w-full border-b shadow-xs transition-all">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6">
            <div className="flex items-center gap-2 overflow-hidden">
              <Megaphone className="size-3.5 shrink-0 animate-bounce" />
              <span className="shrink-0 font-semibold">{bannerAnn.title}:</span>
              <span className="truncate opacity-90">{bannerAnn.content}</span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {bannerAnn.linkUrl && (
                <Link
                  to={cleanUrl(bannerAnn.linkUrl)}
                  className="bg-primary-foreground/15 hover:bg-primary-foreground/25 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors"
                >
                  {bannerAnn.linkText ||
                    t('resources.site.operations.notices.viewLink')}
                  <ArrowRight className="size-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleDismissItem(bannerAnn.id)}
                className="cursor-pointer p-1 opacity-70 transition-opacity hover:opacity-100"
                title={t('resources.site.operations.notices.dismissTitle')}
                aria-label={t('resources.site.operations.notices.dismiss')}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 居中通知弹窗 Modal */}
      {showOverlays && activeModal && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <div className="text-primary mb-1 flex items-center gap-2">
                <BellRing className="size-5" />
                <span className="text-xs font-semibold tracking-wider uppercase">
                  {t('resources.site.operations.notices.modalKicker')}
                </span>
              </div>
              <DialogTitle className="text-base font-bold">
                {activeModal.title}
              </DialogTitle>
              <DialogDescription className="text-foreground/80 pt-2 text-xs leading-relaxed">
                {activeModal.content}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={handleDismissModal}>
                {t('resources.site.operations.notices.modalDismiss')}
              </Button>
              {activeModal.linkUrl && (
                <Button size="sm" asChild onClick={handleDismissModal}>
                  <Link to={cleanUrl(activeModal.linkUrl)}>
                    {activeModal.linkText ||
                      t('resources.site.operations.notices.goLink')}
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 3. 右下角浮动通知卡片 Corner Float (支持收起为不遮挡的悬浮胶囊徽标，位置安全避让页脚按钮) */}
      {showOverlays &&
        cornerAnn &&
        (cornerMinimized ? (
          <div className="animate-in fade-in zoom-in-95 fixed right-4 bottom-8 z-40 duration-200 sm:right-6 sm:bottom-10">
            <button
              type="button"
              onClick={() => setCornerMinimized(false)}
              className="bg-primary/95 hover:bg-primary text-primary-foreground border-primary-foreground/20 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-xs transition-all hover:scale-105"
              title={t('resources.site.operations.notices.expandTitle')}
            >
              <BellRing className="size-3.5 animate-pulse text-amber-300" />
              <span className="max-w-[150px] truncate">{cornerAnn.title}</span>
              <span className="bg-primary-foreground/20 rounded-full px-1.5 py-0.5 text-xs">
                {t('resources.site.operations.notices.expand')}
              </span>
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 fixed right-4 bottom-8 z-40 max-w-xs duration-300 sm:right-6 sm:bottom-10 sm:max-w-sm">
            <Card className="border-primary/25 bg-background/95 shadow-xl backdrop-blur-md">
              <CardHeader className="border-border/50 flex flex-row items-center justify-between space-y-0 border-b p-2.5 px-3 pb-1.5">
                <CardTitle className="text-primary flex items-center gap-1.5 text-xs font-semibold">
                  <BellRing className="text-primary size-3.5" />
                  <span className="max-w-[190px] truncate">
                    {cornerAnn.title}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCornerMinimized(true)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer rounded p-1 transition-colors"
                    title={t('resources.site.operations.notices.minimize')}
                    aria-label={t('resources.site.operations.notices.minimize')}
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissItem(cornerAnn.id)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer rounded p-1 transition-colors"
                    title={t('resources.site.operations.notices.dismissTitle')}
                    aria-label={t('resources.site.operations.notices.dismiss')}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-2.5 px-3 pt-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {cornerAnn.content}
                </p>
                {cornerAnn.linkUrl && (
                  <div className="pt-0.5">
                    <Link
                      to={cleanUrl(cornerAnn.linkUrl)}
                      className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      {cornerAnn.linkText ||
                        t('resources.site.operations.notices.viewNow')}
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

      {/* 4. 底部信息流动跑马灯 Marquee (嵌入在页脚导航的最下方，流式排列，通知在下方显示) */}
      {showMarquee && marqueeAnn && (
        <div className="flex h-8 w-full items-center border-t border-zinc-800 bg-zinc-900 px-4 text-xs text-zinc-100 shadow-sm transition-all dark:bg-zinc-950">
          <div className="text-primary flex shrink-0 items-center gap-1.5 border-r border-zinc-700/80 pr-3 text-xs font-semibold">
            <Volume2 className="size-3.5 animate-pulse" />
            <span>{marqueeAnn.title}</span>
          </div>

          <div className="flex-1 overflow-hidden pl-3 whitespace-nowrap">
            <div className="inline-block animate-[marquee_25s_linear_infinite] text-xs opacity-90">
              <span>{marqueeAnn.content}</span>
              {marqueeAnn.linkUrl && (
                <Link
                  to={cleanUrl(marqueeAnn.linkUrl)}
                  className="text-primary hover:text-primary/80 ml-3 font-medium underline"
                >
                  {marqueeAnn.linkText ||
                    t('resources.site.operations.notices.viewNow')}
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDismissItem(marqueeAnn.id)}
            className="ml-2 shrink-0 cursor-pointer p-1 text-zinc-400 transition-colors hover:text-zinc-100"
            title={t('resources.site.operations.notices.dismissMarqueeTitle')}
            aria-label={t('resources.site.operations.notices.dismissMarquee')}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  )
}

export function TopBannerNotice() {
  return <FloatingNotices placement="banner" />
}

export function OverlayNotices() {
  return <FloatingNotices placement="overlays" />
}

export function BottomMarqueeNotice() {
  return <FloatingNotices placement="marquee" />
}
