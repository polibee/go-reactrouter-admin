import { zodResolver } from '@hookform/resolvers/zod'
import { FolderOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  AdminButton,
  AdminForm,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from '~/components/admin'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { MediaPickerModal } from '~/resources/media/components/media-picker-modal'
import {
  siteWidgetFormSchema,
  type SiteWidgetConfig,
  type SiteWidgetFormValues,
} from '../../types'

export interface WidgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widget?: SiteWidgetConfig | null
  onSubmit: (values: SiteWidgetFormValues) => Promise<void>
  loading?: boolean
}

export function WidgetDialog({
  open,
  onOpenChange,
  widget,
  onSubmit,
  loading = false,
}: WidgetDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(widget)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const form = useForm<SiteWidgetFormValues>({
    resolver: zodResolver(siteWidgetFormSchema),
    defaultValues: {
      key: widget?.key || '',
      title: widget?.title || '',
      description: widget?.description || '',
      placement: widget?.placement || 'both',
      cardType: widget?.cardType || 'preset',
      customContent: widget?.customContent || '',
      imageUrl: widget?.imageUrl || '',
      targetUrl: widget?.targetUrl || '',
      targetWindow: widget?.targetWindow || '_blank',
      linkItemsText: widget?.linkItemsText || '',
      jsCode: widget?.jsCode || '',
      enabled: widget?.enabled ?? true,
      sort: widget?.sort ?? 10,
    },
  })

  const cardType = form.watch('cardType')

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when the edited widget changes
  useEffect(() => {
    if (widget) {
      form.reset({
        key: widget.key,
        title: widget.title,
        description: widget.description || '',
        placement: widget.placement,
        cardType: widget.cardType || 'preset',
        customContent: widget.customContent || '',
        imageUrl: widget.imageUrl || '',
        targetUrl: widget.targetUrl || '',
        targetWindow: widget.targetWindow || '_blank',
        linkItemsText: widget.linkItemsText || '',
        jsCode: widget.jsCode || '',
        enabled: widget.enabled,
        sort: widget.sort,
      })
    } else {
      form.reset({
        key: `widget_${Date.now().toString().slice(-4)}`,
        title: '',
        description: '',
        placement: 'both',
        cardType: 'preset',
        customContent: '',
        imageUrl: '',
        targetUrl: '',
        targetWindow: '_blank',
        linkItemsText: '',
        jsCode: '',
        enabled: true,
        sort: 10,
      })
    }
  }, [widget, form, open])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? t('resources.site.widgets.dialog.editTitle')
                : t('resources.site.widgets.dialog.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('resources.site.widgets.dialog.description')}
            </DialogDescription>
          </DialogHeader>

          <AdminForm<SiteWidgetFormValues>
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
                label={t('resources.site.widgets.dialog.nameLabel')}
                placeholder={t('resources.site.widgets.dialog.namePlaceholder')}
                required
              />
              <TextField
                name="key"
                label={t('resources.site.widgets.dialog.keyLabel')}
                placeholder={t('resources.site.widgets.dialog.keyPlaceholder')}
                description={t('resources.site.widgets.dialog.keyHint')}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                name="placement"
                label={t('resources.site.widgets.dialog.placementLabel')}
                options={[
                  {
                    label: t('resources.site.widgets.dialog.placementBoth'),
                    value: 'both',
                  },
                  {
                    label: t('resources.site.widgets.dialog.placementHome'),
                    value: 'home_sidebar',
                  },
                  {
                    label: t('resources.site.widgets.dialog.placementPage'),
                    value: 'page_sidebar',
                  },
                  {
                    label: t('resources.site.widgets.dialog.placementSite'),
                    value: 'site_sidebar',
                  },
                  {
                    label: t(
                      'resources.site.widgets.dialog.placementDashboard',
                    ),
                    value: 'dashboard',
                  },
                ]}
                required
              />
              <SelectField
                name="cardType"
                label={t('resources.site.widgets.dialog.cardTypeLabel')}
                options={[
                  {
                    label: t('resources.site.widgets.dialog.cardTypePreset'),
                    value: 'preset',
                  },
                  {
                    label: t(
                      'resources.site.widgets.dialog.cardTypeImageBanner',
                    ),
                    value: 'image_banner',
                  },
                  {
                    label: t('resources.site.widgets.dialog.cardTypeLinkList'),
                    value: 'link_list',
                  },
                  {
                    label: t(
                      'resources.site.widgets.dialog.cardTypeCustomHtml',
                    ),
                    value: 'custom_html',
                  },
                  {
                    label: t('resources.site.widgets.dialog.cardTypeCustomJs'),
                    value: 'custom_js',
                  },
                  {
                    label: t(
                      'resources.site.widgets.dialog.cardTypeCustomText',
                    ),
                    value: 'custom_text',
                  },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberField
                name="sort"
                label={t('resources.site.widgets.dialog.sortLabel')}
                required
              />
              <div className="pt-6">
                <SwitchField
                  name="enabled"
                  label={t('resources.site.widgets.dialog.enabledLabel')}
                />
              </div>
            </div>

            <TextField
              name="description"
              label={t('resources.site.widgets.dialog.descriptionLabel')}
              placeholder={t(
                'resources.site.widgets.dialog.descriptionPlaceholder',
              )}
            />

            {cardType === 'image_banner' && (
              <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-medium">
                    {t('resources.site.widgets.dialog.imageSection')}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary/30 hover:bg-primary/10 h-6 gap-1 px-2 text-xs"
                    onClick={() => setMediaPickerOpen(true)}
                  >
                    <FolderOpen className="size-3" />
                    {t('resources.site.widgets.dialog.pickFromMedia')}
                  </Button>
                </div>
                <TextField
                  name="imageUrl"
                  label={t('resources.site.widgets.dialog.imageUrlLabel')}
                  placeholder={t(
                    'resources.site.widgets.dialog.imageUrlPlaceholder',
                  )}
                  required
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    name="targetUrl"
                    label={t('resources.site.widgets.dialog.targetUrlLabel')}
                    placeholder={t(
                      'resources.site.widgets.dialog.targetUrlPlaceholder',
                    )}
                  />
                  <SelectField
                    name="targetWindow"
                    label={t('resources.site.widgets.dialog.targetWindowLabel')}
                    options={[
                      {
                        label: t('resources.site.widgets.dialog.targetBlank'),
                        value: '_blank',
                      },
                      {
                        label: t('resources.site.widgets.dialog.targetSelf'),
                        value: '_self',
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {cardType === 'link_list' && (
              <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                <TextareaField
                  name="linkItemsText"
                  label={t('resources.site.widgets.dialog.linkItemsLabel')}
                  placeholder={t(
                    'resources.site.widgets.dialog.linkItemsPlaceholder',
                  )}
                  rows={4}
                />
                <SelectField
                  name="targetWindow"
                  label={t('resources.site.widgets.dialog.targetWindowLabel')}
                  options={[
                    {
                      label: t('resources.site.widgets.dialog.targetBlank'),
                      value: '_blank',
                    },
                    {
                      label: t('resources.site.widgets.dialog.targetSelf'),
                      value: '_self',
                    },
                  ]}
                />
              </div>
            )}

            {cardType === 'custom_html' && (
              <TextareaField
                name="customContent"
                label={t('resources.site.widgets.dialog.customHtmlLabel')}
                placeholder="<div class='p-3 bg-muted/50 rounded-lg border text-xs'>...</div>"
                rows={5}
              />
            )}

            {cardType === 'custom_js' && (
              <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                <TextareaField
                  name="jsCode"
                  label={t('resources.site.widgets.dialog.jsCodeLabel')}
                  placeholder={t(
                    'resources.site.widgets.dialog.jsCodePlaceholder',
                  )}
                  rows={5}
                />
                <TextareaField
                  name="customContent"
                  label={t('resources.site.widgets.dialog.initialHtmlLabel')}
                  placeholder={t(
                    'resources.site.widgets.dialog.initialHtmlPlaceholder',
                  )}
                  rows={3}
                />
              </div>
            )}

            {cardType === 'custom_text' && (
              <TextareaField
                name="customContent"
                label={t('resources.site.widgets.dialog.customTextLabel')}
                placeholder={t(
                  'resources.site.widgets.dialog.customTextPlaceholder',
                )}
                rows={5}
              />
            )}
          </AdminForm>
        </DialogContent>
      </Dialog>

      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        allowedTypes={['image']}
        title={t('resources.site.widgets.dialog.mediaPickerTitle')}
        onSelect={(item) => {
          form.setValue('imageUrl', item.url, {
            shouldValidate: true,
            shouldDirty: true,
          })
          if (!form.getValues('title')) {
            form.setValue('title', item.name)
          }
          setMediaPickerOpen(false)
        }}
      />
    </>
  )
}
