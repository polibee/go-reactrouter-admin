import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  AdminButton,
  AdminForm,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from '~/components/admin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  siteAnnouncementSchema,
  type SiteAnnouncement,
  type SiteAnnouncementFormValues,
} from '../../types'

export interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: SiteAnnouncement | null
  onSubmit: (values: SiteAnnouncementFormValues) => Promise<void>
  loading?: boolean
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  loading = false,
}: AnnouncementDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(item)

  const form = useForm<SiteAnnouncementFormValues>({
    resolver: zodResolver(siteAnnouncementSchema),
    defaultValues: {
      type: item?.type || 'banner',
      title: item?.title || '',
      content: item?.content || '',
      linkText: item?.linkText || '',
      linkUrl: item?.linkUrl || '',
      style: item?.style || 'info',
      enabled: item?.enabled ?? true,
      showOnce: item?.showOnce ?? false,
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when the edited announcement changes
  useEffect(() => {
    if (item) {
      form.reset({
        type: item.type,
        title: item.title,
        content: item.content,
        linkText: item.linkText || '',
        linkUrl: item.linkUrl || '',
        style: item.style || 'info',
        enabled: item.enabled,
        showOnce: item.showOnce ?? false,
      })
    } else {
      form.reset({
        type: 'banner',
        title: '',
        content: '',
        linkText: '',
        linkUrl: '',
        style: 'info',
        enabled: true,
        showOnce: false,
      })
    }
  }, [item, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('resources.site.operations.announcementDialog.editTitle')
              : t('resources.site.operations.announcementDialog.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('resources.site.operations.announcementDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <AdminForm<SiteAnnouncementFormValues>
          form={form}
          onSubmit={onSubmit}
          loading={loading}
          actions={
            <div className="flex items-center justify-end gap-2 pt-2">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t('common.actions.cancel')}
              </AdminButton>
              <AdminButton type="submit" loading={loading}>
                {isEditing
                  ? t('resources.site.shared.saveChanges')
                  : t(
                      'resources.site.operations.announcementDialog.publishNow',
                    )}
              </AdminButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="type"
              label={t(
                'resources.site.operations.announcementDialog.typeLabel',
              )}
              options={[
                {
                  label: t(
                    'resources.site.operations.announcementDialog.typeBanner',
                  ),
                  value: 'banner',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.typeModal',
                  ),
                  value: 'modal',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.typeCorner',
                  ),
                  value: 'corner',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.typeMarquee',
                  ),
                  value: 'marquee',
                },
              ]}
              required
            />
            <SelectField
              name="style"
              label={t(
                'resources.site.operations.announcementDialog.styleLabel',
              )}
              options={[
                {
                  label: t(
                    'resources.site.operations.announcementDialog.styleInfo',
                  ),
                  value: 'info',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.styleDefault',
                  ),
                  value: 'default',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.styleWarning',
                  ),
                  value: 'warning',
                },
                {
                  label: t(
                    'resources.site.operations.announcementDialog.styleDestructive',
                  ),
                  value: 'destructive',
                },
              ]}
              required
            />
          </div>

          <TextField
            name="title"
            label={t('resources.site.operations.announcementDialog.titleLabel')}
            placeholder={t(
              'resources.site.operations.announcementDialog.titlePlaceholder',
            )}
            required
          />

          <TextareaField
            name="content"
            label={t(
              'resources.site.operations.announcementDialog.contentLabel',
            )}
            placeholder={t(
              'resources.site.operations.announcementDialog.contentPlaceholder',
            )}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="linkText"
              label={t(
                'resources.site.operations.announcementDialog.linkTextLabel',
              )}
              placeholder={t(
                'resources.site.operations.announcementDialog.linkTextPlaceholder',
              )}
            />
            <TextField
              name="linkUrl"
              label={t(
                'resources.site.operations.announcementDialog.linkUrlLabel',
              )}
              placeholder={t(
                'resources.site.operations.announcementDialog.linkUrlPlaceholder',
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <SwitchField
              name="enabled"
              label={t(
                'resources.site.operations.announcementDialog.enabledLabel',
              )}
            />
            <SwitchField
              name="showOnce"
              label={t(
                'resources.site.operations.announcementDialog.showOnceLabel',
              )}
            />
          </div>
        </AdminForm>
      </DialogContent>
    </Dialog>
  )
}
