import { useEffect, useState } from 'react'
import { siteService } from '../../service'
import type { SiteWidgetConfig, SiteWidgetGlobalSettings } from '../../types'
import { AnnouncementCard } from './cards/announcement-card'
import { ContactInfoCard } from './cards/contact-info-card'
import { CustomContentCard } from './cards/custom-content-card'
import { QuickLinksCard } from './cards/quick-links-card'
import { SponsorAdCard } from './cards/sponsor-ad-card'
import { StatsMetricCard } from './cards/stats-metric-card'
import { WidgetContext } from './widget-context'

export interface WidgetRendererProps {
  placement: 'dashboard' | 'home_sidebar' | 'page_sidebar' | 'site_sidebar'
  className?: string
}

export function WidgetRenderer({ placement, className }: WidgetRendererProps) {
  const [widgets, setWidgets] = useState<SiteWidgetConfig[]>([])
  const [settings, setSettings] = useState<SiteWidgetGlobalSettings>(() =>
    siteService.getWidgetGlobalSettings(),
  )

  useEffect(() => {
    const load = async () => {
      const list = await siteService.getWidgetsForPlacement(placement)
      setWidgets(list)
    }
    load()

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<SiteWidgetGlobalSettings>
      if (customEvent.detail) {
        setSettings(customEvent.detail)
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
  }, [placement])

  if (widgets.length === 0) {
    return null
  }

  const defaultGapClass =
    settings.density === 'compact' ? 'space-y-2.5' : 'space-y-3.5'
  const containerClass = className || defaultGapClass

  const renderCard = (w: SiteWidgetConfig) => {
    if (w.cardType && w.cardType !== 'preset') {
      return <CustomContentCard widget={w} />
    }

    switch (w.key) {
      case 'quick_links':
        return <QuickLinksCard />
      case 'stats_metric':
        return <StatsMetricCard />
      case 'announcements':
        return <AnnouncementCard />
      case 'contact_info':
        return <ContactInfoCard />
      case 'sponsor_ad':
        return <SponsorAdCard widget={w} />
      default:
        return <CustomContentCard widget={w} />
    }
  }

  return (
    <WidgetContext.Provider
      value={{
        density: settings.density,
        showCardDividers: settings.showCardDividers,
      }}
    >
      <div className={containerClass}>
        {widgets.map((w) => (
          <div key={w.id}>{renderCard(w)}</div>
        ))}
      </div>
    </WidgetContext.Provider>
  )
}
