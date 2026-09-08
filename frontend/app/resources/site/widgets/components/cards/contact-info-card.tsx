import { Globe, Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useWidgetContext } from '../widget-context'

export function ContactInfoCard() {
  const { t } = useTranslation()
  const { density, showCardDividers } = useWidgetContext()
  const isCompact = density === 'compact'

  return (
    <Card className="border shadow-xs">
      <CardHeader
        className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
      >
        <CardTitle className="flex items-center justify-between text-xs font-semibold">
          <span>{t('resources.site.widgets.cards.contact.title')}</span>
          <ShieldCheck className="size-2.5 text-emerald-500" />
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`${isCompact ? 'space-y-1 p-2 px-2.5' : 'space-y-1.5 p-2.5'} text-xs sm:text-xs`}
      >
        <div className="text-muted-foreground flex items-center gap-1.5">
          <Mail className="text-primary size-2.5 shrink-0" />
          <span className="truncate">
            {t('resources.site.widgets.cards.contact.support')}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5">
          <MessageCircle className="text-primary size-2.5 shrink-0" />
          <span className="truncate">
            {t('resources.site.widgets.cards.contact.hours')}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5">
          <Globe className="text-primary size-2.5 shrink-0" />
          <span className="truncate">
            {t('resources.site.widgets.cards.contact.community')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
