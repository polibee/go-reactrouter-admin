import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  AdminButton,
  AdminForm,
  RichTextField,
  SelectField,
  TextField,
  TextareaField,
} from '~/components/admin'
import { NameTranslationsInput } from '../../components/name-translations-input'
import {
  sitePageFormSchema,
  type SitePage,
  type SitePageFormValues,
} from '../../types'

export interface PageFormProps {
  initialData?: SitePage | null
  onSubmit: (data: SitePageFormValues) => Promise<void>
  loading?: boolean
  submitText?: string
}

export function PageForm({
  initialData,
  onSubmit,
  loading = false,
  submitText,
}: PageFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const resolvedSubmitText = submitText ?? t('resources.site.pages.form.submit')

  const form = useForm<SitePageFormValues>({
    resolver: zodResolver(sitePageFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      seoKeywords: initialData?.seoKeywords || '',
      status: initialData?.status || 'published',
      nameTranslations: initialData?.nameTranslations || {},
    },
  })

  return (
    <AdminForm<SitePageFormValues>
      form={form}
      onSubmit={onSubmit}
      loading={loading}
      submitText={resolvedSubmitText}
      actions={
        <div className="flex items-center gap-3">
          <AdminButton type="submit" loading={loading}>
            {resolvedSubmitText}
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/pages')}
            disabled={loading}
          >
            {t('resources.site.pages.form.cancelBack')}
          </AdminButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextField
          name="title"
          label={t('resources.site.pages.form.titleLabel')}
          placeholder={t('resources.site.pages.form.titlePlaceholder')}
          required
        />
        <TextField
          name="slug"
          label={t('resources.site.pages.form.slugLabel')}
          placeholder={t('resources.site.pages.form.slugPlaceholder')}
          description={t('resources.site.pages.form.slugHint', {
            slug: '{slug}',
          })}
          required
        />
        <SelectField
          name="status"
          label={t('resources.site.pages.form.statusLabel')}
          options={[
            {
              label: t('resources.site.pages.form.statusPublished'),
              value: 'published',
            },
            {
              label: t('resources.site.pages.form.statusDraft'),
              value: 'draft',
            },
          ]}
          required
        />
      </div>

      <RichTextField
        name="content"
        label={t('resources.site.pages.form.contentLabel')}
        placeholder={t('resources.site.pages.form.contentPlaceholder')}
        minHeight="380px"
        required
      />

      <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
        <h4 className="text-foreground text-sm font-semibold">
          {t('resources.site.pages.form.seoHeading')}
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            name="seoTitle"
            label={t('resources.site.pages.form.seoTitleLabel')}
            placeholder={t('resources.site.pages.form.seoTitlePlaceholder')}
          />
          <TextField
            name="seoKeywords"
            label={t('resources.site.pages.form.seoKeywordsLabel')}
            placeholder={t('resources.site.pages.form.seoKeywordsPlaceholder')}
          />
        </div>
        <TextareaField
          name="seoDescription"
          label={t('resources.site.pages.form.seoDescriptionLabel')}
          placeholder={t('resources.site.pages.form.seoDescriptionPlaceholder')}
          rows={3}
        />
      </div>

      <Controller
        control={form.control}
        name="nameTranslations"
        render={({ field }) => (
          <NameTranslationsInput
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </AdminForm>
  )
}
