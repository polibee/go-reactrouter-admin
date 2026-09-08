import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
  CreateAction,
} from '~/components/admin'
import { i18n } from '~/core/i18n'
import { PageTable } from '~/resources/site/pages/components/page-table'
import { siteService } from '~/resources/site/service'
import type { SitePage } from '~/resources/site/types'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.sitePages.metaTitle') }]
}

export const handle = {
  breadcrumb: () => ({ label: i18n.t('pages.admin.sitePages.title') }),
}

export default function SitePagesIndexPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await siteService.getPages()
      setPages(data)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadData()
  }, [])

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.sitePages.title')}
        description={t('pages.admin.sitePages.description')}
        actions={
          <CreateAction
            label={t('pages.admin.sitePages.createAction')}
            onClick={() => navigate('/admin/pages/create')}
            permission="site.pages"
          />
        }
      />

      <AdminPageContent>
        <PageTable data={pages} loading={loading} onDataChange={loadData} />
      </AdminPageContent>
    </AdminPage>
  )
}
