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
  siteAdSlotSchema,
  type SiteAdSlot,
  type SiteAdSlotFormValues,
} from '../../types'

export interface AdSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot?: SiteAdSlot | null
  onSubmit: (values: SiteAdSlotFormValues) => Promise<void>
  loading?: boolean
}

export function AdSlotDialog({
  open,
  onOpenChange,
  slot,
  onSubmit,
  loading = false,
}: AdSlotDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(slot)

  const form = useForm<SiteAdSlotFormValues>({
    resolver: zodResolver(siteAdSlotSchema),
    defaultValues: {
      slotKey: slot?.slotKey || '',
      title: slot?.title || '',
      adType: slot?.adType || 'text',
      imageUrl: slot?.imageUrl || '',
      targetUrl: slot?.targetUrl || '',
      text: slot?.text || '',
      htmlContent: slot?.htmlContent || '',
      enabled: slot?.enabled ?? true,
    },
  })

  const adType = form.watch('adType')

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when the edited slot changes
  useEffect(() => {
    if (slot) {
      form.reset({
        slotKey: slot.slotKey,
        title: slot.title,
        adType: slot.adType,
        imageUrl: slot.imageUrl || '',
        targetUrl: slot.targetUrl || '',
        text: slot.text || '',
        htmlContent: slot.htmlContent || '',
        enabled: slot.enabled,
      })
    } else {
      form.reset({
        slotKey: `ad_slot_${Date.now().toString().slice(-4)}`,
        title: '',
        adType: 'text',
        imageUrl: '',
        targetUrl: '',
        text: '',
        htmlContent: '',
        enabled: true,
      })
    }
  }, [slot, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('resources.site.operations.adDialog.editTitle')
              : t('resources.site.operations.adDialog.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('resources.site.operations.adDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <AdminForm<SiteAdSlotFormValues>
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
                  : t('resources.site.shared.createNow')}
              </AdminButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="title"
              label={t('resources.site.operations.adDialog.nameLabel')}
              placeholder={t(
                'resources.site.operations.adDialog.namePlaceholder',
              )}
              required
            />
            <TextField
              name="slotKey"
              label={t('resources.site.operations.adDialog.slotKeyLabel')}
              placeholder={t(
                'resources.site.operations.adDialog.slotKeyPlaceholder',
              )}
              description={t('resources.site.operations.adDialog.slotKeyHint')}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="adType"
              label={t('resources.site.operations.adDialog.adTypeLabel')}
              options={[
                {
                  label: t('resources.site.operations.adDialog.adTypeText'),
                  value: 'text',
                },
                {
                  label: t('resources.site.operations.adDialog.adTypeImage'),
                  value: 'image',
                },
                {
                  label: t('resources.site.operations.adDialog.adTypeHtml'),
                  value: 'html',
                },
              ]}
              required
            />
            <div className="pt-6">
              <SwitchField
                name="enabled"
                label={t('resources.site.operations.adDialog.enabledLabel')}
              />
            </div>
          </div>

          {adType === 'text' && (
            <div className="space-y-3">
              <TextField
                name="text"
                label={t('resources.site.operations.adDialog.textLabel')}
                placeholder={t(
                  'resources.site.operations.adDialog.textPlaceholder',
                )}
                required
              />
              <TextField
                name="targetUrl"
                label={t('resources.site.operations.adDialog.targetUrlLabel')}
                placeholder="https://..."
              />
            </div>
          )}

          {adType === 'image' && (
            <div className="space-y-3">
              <TextField
                name="imageUrl"
                label={t('resources.site.operations.adDialog.imageUrlLabel')}
                placeholder="https://example.com/banner.png"
                required
              />
              <TextField
                name="targetUrl"
                label={t('resources.site.operations.adDialog.clickUrlLabel')}
                placeholder="https://..."
              />
            </div>
          )}

          {adType === 'html' && (
            <TextareaField
              name="htmlContent"
              label={t('resources.site.operations.adDialog.htmlLabel')}
              placeholder="<div id='ad-partner-widget'>...</div>"
              rows={4}
              required
            />
          )}
        </AdminForm>
      </DialogContent>
    </Dialog>
  )
}
