import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  AdminButton,
  AdminForm,
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
  friendLinkGuidelinesSchema,
  type FriendLinkGuidelines,
  type FriendLinkGuidelinesFormValues,
} from '../../types'

export interface GuidelinesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guidelines: FriendLinkGuidelines | null
  onSubmit: (values: FriendLinkGuidelinesFormValues) => Promise<void>
  loading?: boolean
}

export function GuidelinesDialog({
  open,
  onOpenChange,
  guidelines,
  onSubmit,
  loading = false,
}: GuidelinesDialogProps) {
  const { t } = useTranslation()
  const form = useForm<FriendLinkGuidelinesFormValues>({
    resolver: zodResolver(friendLinkGuidelinesSchema),
    defaultValues: {
      title:
        guidelines?.title || t('resources.site.links.apply.fallback.title'),
      rule1Title:
        guidelines?.rule1Title ||
        t('resources.site.links.apply.fallback.rule1Title'),
      rule1Desc:
        guidelines?.rule1Desc ||
        t('resources.site.links.apply.fallback.rule1Desc'),
      rule2Title:
        guidelines?.rule2Title ||
        t('resources.site.links.apply.fallback.rule2Title'),
      rule2Desc:
        guidelines?.rule2Desc ||
        t('resources.site.links.apply.fallback.rule2Desc'),
      rule3Title:
        guidelines?.rule3Title ||
        t('resources.site.links.apply.fallback.rule3Title'),
      rule3Desc:
        guidelines?.rule3Desc ||
        t('resources.site.links.apply.fallback.rule3Desc'),
      customNotice:
        guidelines?.customNotice ||
        t('resources.site.links.apply.fallback.customNotice'),
    },
  })

  useEffect(() => {
    if (guidelines && open) {
      form.reset({
        title: guidelines.title,
        rule1Title: guidelines.rule1Title,
        rule1Desc: guidelines.rule1Desc,
        rule2Title: guidelines.rule2Title,
        rule2Desc: guidelines.rule2Desc,
        rule3Title: guidelines.rule3Title,
        rule3Desc: guidelines.rule3Desc,
        customNotice: guidelines.customNotice || '',
      })
    }
  }, [guidelines, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t('resources.site.links.guidelines.title')}
          </DialogTitle>
          <DialogDescription>
            {t('resources.site.links.guidelines.description')}
          </DialogDescription>
        </DialogHeader>

        <AdminForm<FriendLinkGuidelinesFormValues>
          form={form}
          onSubmit={onSubmit}
          loading={loading}
          actions={
            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t('common.actions.cancel')}
              </AdminButton>
              <AdminButton type="submit" loading={loading}>
                {t('resources.site.links.guidelines.save')}
              </AdminButton>
            </div>
          }
        >
          <div className="space-y-4">
            <TextField
              name="title"
              label={t('resources.site.links.guidelines.titleLabel')}
              placeholder={t(
                'resources.site.links.guidelines.titlePlaceholder',
              )}
              required
            />

            {/* 规则 1 */}
            <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
              <TextField
                name="rule1Title"
                label={t('resources.site.links.guidelines.rule1TitleLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule1TitlePlaceholder',
                )}
                required
              />
              <TextareaField
                name="rule1Desc"
                label={t('resources.site.links.guidelines.rule1DescLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule1DescPlaceholder',
                )}
                rows={2}
                required
              />
            </div>

            {/* 规则 2 */}
            <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
              <TextField
                name="rule2Title"
                label={t('resources.site.links.guidelines.rule2TitleLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule2TitlePlaceholder',
                )}
                required
              />
              <TextareaField
                name="rule2Desc"
                label={t('resources.site.links.guidelines.rule2DescLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule2DescPlaceholder',
                )}
                rows={2}
                required
              />
            </div>

            {/* 规则 3 */}
            <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
              <TextField
                name="rule3Title"
                label={t('resources.site.links.guidelines.rule3TitleLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule3TitlePlaceholder',
                )}
                required
              />
              <TextareaField
                name="rule3Desc"
                label={t('resources.site.links.guidelines.rule3DescLabel')}
                placeholder={t(
                  'resources.site.links.guidelines.rule3DescPlaceholder',
                )}
                rows={2}
                required
              />
            </div>

            <TextareaField
              name="customNotice"
              label={t('resources.site.links.guidelines.customNoticeLabel')}
              placeholder={t(
                'resources.site.links.guidelines.customNoticePlaceholder',
              )}
              rows={2}
            />
          </div>
        </AdminForm>
      </DialogContent>
    </Dialog>
  )
}
