import { ArrowRight, Bell, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useWidgetContext } from '../widget-context'

export function AnnouncementCard() {
  const { t } = useTranslation()
  const { density, showCardDividers } = useWidgetContext()
  const isCompact = density === 'compact'

  const notices = [
    {
      title: t('resources.site.widgets.cards.announcements.engineReadyTitle'),
      date: t('resources.site.widgets.cards.announcements.dateToday'),
      summary: t(
        'resources.site.widgets.cards.announcements.engineReadySummary',
      ),
      link: '/about',
    },
    {
      title: t('resources.site.widgets.cards.announcements.portalLaunchTitle'),
      date: t('resources.site.widgets.cards.announcements.dateTwoDaysAgo'),
      summary: t(
        'resources.site.widgets.cards.announcements.portalLaunchSummary',
      ),
      link: '/about',
    },
  ]

  return (
    <Card className="border shadow-xs">
      <CardHeader
        className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
      >
        <CardTitle className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Bell className="text-primary size-3" />
            {t('resources.site.widgets.cards.announcements.title')}
          </span>
          <Sparkles className="size-2.5 text-amber-500" />
        </CardTitle>
      </CardHeader>
      <CardContent
        className={isCompact ? 'space-y-1.5 p-2 px-2.5' : 'space-y-2 p-2.5'}
      >
        {notices.map((n) => (
          <div
            key={n.title}
            className="border-border/50 space-y-0.5 border-b pb-1 text-xs last:border-b-0 last:pb-0"
          >
            <div className="text-foreground flex items-center justify-between font-medium">
              <span className="truncate pr-1 text-xs font-semibold">
                {n.title}
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-[9px]">
                {n.date}
              </span>
            </div>
            <p className="text-muted-foreground line-clamp-1 text-xs leading-snug">
              {n.summary}
            </p>
            <div className="pt-0.2">
              <Link
                to={n.link}
                className="text-primary inline-flex items-center gap-0.5 text-[9px] font-medium hover:underline sm:text-xs"
              >
                {t('resources.site.widgets.cards.announcements.readMore')}{' '}
                <ArrowRight className="size-2" />
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
