import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  AdminButton,
  AdminForm,
  NumberField,
  SelectField,
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
  friendLinkFormSchema,
  type FriendLink,
  type FriendLinkFormValues,
} from '../../types'

export interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: FriendLink | null
  onSubmit: (values: FriendLinkFormValues) => Promise<void>
  loading?: boolean
}

export function LinkDialog({
  open,
  onOpenChange,
  link,
  onSubmit,
  loading = false,
}: LinkDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(link)

  const form = useForm<FriendLinkFormValues>({
    resolver: zodResolver(friendLinkFormSchema),
    defaultValues: {
      name: link?.name || '',
      url: link?.url || '',
      logo: link?.logo || '',
      description: link?.description || '',
      email: link?.email || '',
      status: link?.status || 'approved',
      sort: link?.sort ?? 10,
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when the edited link changes
  useEffect(() => {
    if (link) {
      form.reset({
        name: link.name,
        url: link.url,
        logo: link.logo || '',
        description: link.description || '',
        email: link.email || '',
        status: link.status,
        sort: link.sort,
      })
    } else {
      form.reset({
        name: '',
        url: '',
        logo: '',
        description: '',
        email: '',
        status: 'approved',
        sort: 10,
      })
    }
  }, [link, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('resources.site.links.dialog.editTitle')
              : t('resources.site.links.dialog.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('resources.site.links.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <AdminForm<FriendLinkFormValues>
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
                  : t('resources.site.links.dialog.addNow')}
              </AdminButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="name"
              label={t('resources.site.links.dialog.nameLabel')}
              placeholder={t('resources.site.links.dialog.namePlaceholder')}
              required
            />
            <TextField
              name="url"
              label={t('resources.site.links.dialog.urlLabel')}
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="logo"
              label={t('resources.site.links.dialog.logoLabel')}
              placeholder="https://.../favicon.ico"
            />
            <TextField
              name="email"
              label={t('resources.site.links.dialog.emailLabel')}
              placeholder="admin@example.com"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="status"
              label={t('resources.site.links.dialog.statusLabel')}
              options={[
                {
                  label: t('resources.site.links.dialog.statusApproved'),
                  value: 'approved',
                },
                {
                  label: t('resources.site.links.dialog.statusPending'),
                  value: 'pending',
                },
                {
                  label: t('resources.site.links.dialog.statusRejected'),
                  value: 'rejected',
                },
              ]}
              required
            />
            <NumberField
              name="sort"
              label={t('resources.site.links.dialog.sortLabel')}
              required
            />
          </div>

          <TextareaField
            name="description"
            label={t('resources.site.links.dialog.descriptionLabel')}
            placeholder={t(
              'resources.site.links.dialog.descriptionPlaceholder',
            )}
            rows={2}
          />
        </AdminForm>
      </DialogContent>
    </Dialog>
  )
}
