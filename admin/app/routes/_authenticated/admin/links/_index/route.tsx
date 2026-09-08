import { useTranslation } from 'react-i18next'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
} from '~/components/admin'
import { LinkTable } from '~/resources/site/links'

export default function AdminLinksRoute() {
  const { t } = useTranslation()
  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.friendLinks.title')}
        description={t('pages.admin.friendLinks.description')}
      />
      <AdminPageContent>
        <LinkTable />
      </AdminPageContent>
    </AdminPage>
  )
}
