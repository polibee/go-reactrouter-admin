import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  AdminCard,
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
  notify,
} from '~/components/admin'
import { i18n } from '~/core/i18n'
import { PageForm } from '~/resources/site/pages/components/page-form'
import { siteService } from '~/resources/site/service'
import type { SitePageFormValues } from '~/resources/site/types'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.sitePages.createMetaTitle') }]
}

export const handle = {
  breadcrumb: () => ({
    label: i18n.t('pages.admin.sitePages.createAction'),
    to: '/admin/pages/create',
  }),
}

export default function SitePageCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: SitePageFormValues) => {
    setLoading(true)
    try {
      const created = await siteService.createPage(data)
      notify.success(
        t('pages.admin.sitePages.createSuccess', { title: created.title }),
      )
      navigate('/admin/pages')
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.sitePages.createFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.sitePages.createAction')}
        description={t('pages.admin.sitePages.createDescription')}
      />

      <AdminPageContent>
        <AdminCard
          title={t('pages.admin.sitePages.createCardTitle')}
          description={t('pages.admin.requiredHint')}
        >
          <PageForm
            onSubmit={handleSubmit}
            loading={loading}
            submitText={t('pages.admin.sitePages.createSubmit')}
          />
        </AdminCard>
      </AdminPageContent>
    </AdminPage>
  )
}
