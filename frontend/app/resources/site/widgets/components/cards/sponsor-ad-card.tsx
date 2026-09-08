import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { siteService } from '../../../service'
import type { SiteAdSlot, SiteWidgetConfig } from '../../../types'
import { useWidgetContext } from '../widget-context'

export interface SponsorAdCardProps {
  widget?: SiteWidgetConfig
}

export function SponsorAdCard({ widget }: SponsorAdCardProps) {
  const { t } = useTranslation()
  const { density, showCardDividers } = useWidgetContext()
  const isCompact = density === 'compact'
  const [ad, setAd] = useState<SiteAdSlot | null>(null)

  useEffect(() => {
    const load = async () => {
      const activeAd = await siteService.getActiveAdSlot('sidebar_card')
      setAd(activeAd)
    }
    load()
  }, [])

  const title =
    widget?.title ||
    ad?.title ||
    t('resources.site.widgets.cards.sponsor.fallbackTitle')
  const text =
    widget?.description ||
    ad?.text ||
    ad?.title ||
    t('resources.site.widgets.cards.sponsor.fallbackText')
  const imageUrl = widget?.imageUrl || ad?.imageUrl
  const targetUrl = widget?.targetUrl || ad?.targetUrl || '/about'
  const targetWindow = widget?.targetWindow || '_self'

  return (
    <Card className="border-primary/20 from-primary/5 via-background to-background overflow-hidden bg-linear-to-b shadow-xs">
      <CardHeader
        className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-primary flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="size-3 text-amber-500" />
            {title}
          </span>
          <span className="text-muted-foreground bg-muted/80 rounded px-1 py-0.5 font-mono text-[9px]">
            {t('resources.site.widgets.cards.sponsor.badge')}
          </span>
        </div>
      </CardHeader>
      <CardContent
        className={
          isCompact ? 'space-y-1.5 p-2 px-2.5 pt-1.5' : 'space-y-2 p-3 pt-2'
        }
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className={`w-full rounded-md border object-cover ${isCompact ? 'h-16' : 'h-20'}`}
          />
        )}
        <p className="text-foreground/90 line-clamp-2 text-xs leading-snug font-medium">
          {text}
        </p>
        <div className="pt-0.2">
          {targetUrl.startsWith('http') ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              {t('resources.site.widgets.cards.sponsor.learnMore')}{' '}
              <ExternalLink className="size-2" />
            </a>
          ) : (
            <Button
              size="sm"
              variant="link"
              asChild
              className="text-primary h-auto p-0 text-xs font-medium"
            >
              <Link to={targetUrl} target={targetWindow}>
                {t('resources.site.widgets.cards.sponsor.learnMore')}{' '}
                <ArrowRight className="ml-0.5 size-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
