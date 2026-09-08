import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Eye, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  AdminBadge,
  AdminTable,
  DeleteAction,
  EditAction,
  ViewAction,
  notify,
} from '~/components/admin'
import { siteService } from '../../service'
import type { SitePage } from '../../types'

export interface PageTableProps {
  data: SitePage[]
  loading?: boolean
  onDataChange?: () => void
}

export function PageTable({ data, loading, onDataChange }: PageTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleDelete = async (page: SitePage) => {
    try {
      await siteService.deletePage(page.id)
      notify.success(
        t('resources.site.pages.table.deleted', { name: page.title }),
      )
      if (onDataChange) onDataChange()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.shared.deleteFailed'))
    }
  }

  const columns: ColumnDef<SitePage>[] = [
    {
      accessorKey: 'title',
      header: t('resources.site.pages.table.columnTitle'),
      cell: ({ row }) => {
        const page = row.original
        return (
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-foreground font-medium">{page.title}</div>
              <div className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
                <span>/{page.slug}</span>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary inline-flex items-center"
                >
                  <ExternalLink className="ml-0.5 size-3" />
                </a>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('resources.site.pages.table.columnStatus'),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <AdminBadge status={status === 'published' ? 'success' : 'warning'}>
            {status === 'published'
              ? t('resources.site.pages.table.published')
              : t('resources.site.pages.table.draft')}
          </AdminBadge>
        )
      },
    },
    {
      accessorKey: 'views',
      header: t('resources.site.pages.table.columnViews'),
      cell: ({ row }) => (
        <span className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
          <Eye className="size-3" />
          {row.original.views.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: t('resources.site.pages.table.columnUpdatedAt'),
      cell: ({ row }) => {
        const dateStr = row.getValue('updatedAt') as string
        return (
          <span className="text-muted-foreground font-mono text-xs">
            {dateStr ? dateStr.slice(0, 10) : '-'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-right">{t('common.labels.actions')}</div>
      ),
      cell: ({ row }) => {
        const page = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <ViewAction
              onClick={() => window.open(`/${page.slug}`, '_blank')}
            />
            <EditAction
              permission="site.pages"
              onClick={() =>
                navigate(
                  `/admin/pages/${page.slug || page.id.replace(/^page-/, '')}/edit`,
                )
              }
            />
            <DeleteAction
              permission="site.pages"
              itemTitle={page.title}
              confirmDescription={t(
                'resources.site.pages.table.deleteDescription',
                { name: page.title },
              )}
              onAction={() => handleDelete(page)}
            />
          </div>
        )
      },
    },
  ]

  return (
    <AdminTable
      columns={columns}
      data={data}
      loading={loading}
      searchKey="title"
      searchPlaceholder={t('resources.site.pages.table.searchPlaceholder')}
    />
  )
}
