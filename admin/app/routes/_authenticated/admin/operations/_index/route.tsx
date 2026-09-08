import { Megaphone, MonitorPlay } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { i18n } from '~/core/i18n'
import { AdSlotManager } from '~/resources/site/operations/components/ad-slot-manager'
import { AnnouncementManager } from '~/resources/site/operations/components/announcement-manager'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.operations.metaTitle') }]
}

export const handle = {
  breadcrumb: () => ({ label: i18n.t('pages.admin.operations.title') }),
}

export default function SiteOperationsPage() {
  const { t } = useTranslation()
  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.operations.heading')}
        description={t('pages.admin.operations.description')}
      />

      <AdminPageContent>
        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList className="grid w-full max-w-[420px] grid-cols-2">
            <TabsTrigger value="announcements" className="gap-1.5">
              <Megaphone className="size-3.5" />
              {t('pages.admin.operations.tabNotices')}
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5">
              <MonitorPlay className="size-3.5" />
              {t('pages.admin.operations.tabAds')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementManager />
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            <AdSlotManager />
          </TabsContent>
        </Tabs>
      </AdminPageContent>
    </AdminPage>
  )
}
