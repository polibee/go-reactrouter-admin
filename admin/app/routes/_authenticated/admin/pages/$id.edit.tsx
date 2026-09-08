import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import {
  AdminCard,
  AdminEmpty,
  AdminLoading,
  AdminPage,
  AdminPageContent,
  AdminPageHeader,
  notify,
} from '~/components/admin'
import { i18n } from '~/core/i18n'
import { PageForm } from '~/resources/site/pages/components/page-form'
import { siteService } from '~/resources/site/service'
import type { SitePage, SitePageFormValues } from '~/resources/site/types'

export const meta = () => {
  return [{ title: i18n.t('pages.admin.sitePages.editMetaTitle') }]
}

export const handle = {
  breadcrumb: () => ({ label: i18n.t('pages.admin.sitePages.editTitle') }),
}

export default function SitePageEdit() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<SitePage | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchPage = async () => {
      setFetching(true)
      try {
        const data = await siteService.getPageById(id)
        setPage(data)
      } finally {
        setFetching(false)
      }
    }
    fetchPage()
  }, [id])

  const handleSubmit = async (data: SitePageFormValues) => {
    if (!id) return
    setSaving(true)
    try {
      await siteService.updatePage(id, data)
      notify.success(t('pages.admin.sitePages.updateSuccess'))
      navigate('/admin/pages')
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('pages.admin.sitePages.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <AdminPage>
        <AdminLoading text={t('pages.admin.sitePages.loading')} />
      </AdminPage>
    )
  }

  if (!page) {
    return (
      <AdminPage>
        <AdminEmpty
          title={t('pages.admin.sitePages.notFoundTitle')}
          description={t('pages.admin.sitePages.notFoundDescription')}
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/pages')}
              className="text-primary cursor-pointer text-sm underline"
            >
              {t('pages.admin.sitePages.backToList')}
            </button>
          }
        />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('pages.admin.sitePages.editHeading', { title: page.title })}
        description={t('pages.admin.sitePages.viewMeta', {
          slug: page.slug,
          views: page.views,
        })}
      />

      <AdminPageContent>
        <AdminCard
          title={t('pages.admin.sitePages.editCardTitle')}
          description={t('pages.admin.sitePages.idLabel', {
            id: page.slug || page.id.replace(/^page-/, ''),
          })}
        >
          <PageForm
            initialData={page}
            onSubmit={handleSubmit}
            loading={saving}
            submitText={t('pages.admin.sitePages.editSubmit')}
          />
        </AdminCard>
      </AdminPageContent>
    </AdminPage>
  )
}
