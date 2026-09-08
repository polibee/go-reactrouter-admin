import { useTranslation } from 'react-i18next'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin'
import { i18n } from '~/core/i18n'
import { NavigationEditor } from '~/resources/site/navigation/components/navigation-editor'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.navigation.metaTitle') }]
}

export const handle = {
  breadcrumb: () => ({ label: i18n.t('pages.admin.navigation.title') }),
}

export default function SiteNavigationPage() {
  const { t } = useTranslation()
  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.navigation.heading')}
        description={t('pages.admin.navigation.description')}
      />

      <AdminPageContent>
        <NavigationEditor />
      </AdminPageContent>
    </AdminPage>
  )
}
