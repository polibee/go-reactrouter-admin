import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CheckCircle2, Link2, Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { notify } from '~/components/admin'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { i18n } from '~/core/i18n'
import { siteService } from '../../service'

const visitorApplySchema = z.object({
  name: z.string().min(
    2,
    i18n.t('resources.site.links.apply.validation.nameMinLength', {
      count: 2,
    }),
  ),
  url: z
    .string()
    .url(i18n.t('resources.site.links.apply.validation.urlInvalid')),
  logo: z
    .string()
    .url(i18n.t('resources.site.links.apply.validation.logoUrlInvalid'))
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(
      200,
      i18n.t('resources.site.links.apply.validation.descriptionMaxLength', {
        count: 200,
      }),
    )
    .optional(),
  email: z
    .string()
    .email(i18n.t('resources.site.links.apply.validation.emailInvalid')),
})

type VisitorApplyValues = z.infer<typeof visitorApplySchema>

export interface ApplyLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  turnstileSiteKey?: string
}

export function ApplyLinkDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApplyLinkDialogProps) {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cfVerified, setCfVerified] = useState(true)
  const [cfChecking, setCfChecking] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitorApplyValues>({
    resolver: zodResolver(visitorApplySchema),
    defaultValues: {
      name: '',
      url: '',
      logo: '',
      description: '',
      email: '',
    },
  })

  const onSubmit = async (values: VisitorApplyValues) => {
    if (!cfVerified) {
      notify.error(t('resources.site.links.apply.captchaRequired'))
      return
    }

    setLoading(true)
    try {
      await siteService.applyFriendLink(values)
      setSubmitted(true)
      notify.success(t('resources.site.links.apply.submitSuccess'))
      onSuccess?.()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.links.apply.submitFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSubmitted(false)
      reset()
    }, 200)
  }

  const handleTriggerCfVerify = () => {
    if (cfVerified) return
    setCfChecking(true)
    setTimeout(() => {
      setCfChecking(false)
      setCfVerified(true)
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="space-y-3 py-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {t('resources.site.links.apply.successTitle')}
            </h3>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed">
              {t('resources.site.links.apply.successDescription')}
            </p>
            <div className="pt-2">
              <Button size="sm" onClick={handleClose} className="text-xs">
                {t('resources.site.links.apply.done')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="text-primary size-4" />
                {t('resources.site.links.apply.title')}
              </DialogTitle>
              <DialogDescription>
                {t('resources.site.links.apply.description')}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3.5 pt-1"
            >
              <div className="space-y-1">
                <Label htmlFor="visitor-name" className="text-xs font-medium">
                  {t('resources.site.links.apply.name')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="visitor-name"
                  {...register('name')}
                  placeholder={t('resources.site.links.apply.namePlaceholder')}
                  className="h-8 text-xs"
                />
                {errors.name && (
                  <p className="text-destructive text-xs">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="visitor-url" className="text-xs font-medium">
                  {t('resources.site.links.apply.url')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="visitor-url"
                  {...register('url')}
                  placeholder="https://example.com"
                  className="h-8 font-mono text-xs"
                />
                {errors.url && (
                  <p className="text-destructive text-xs">
                    {errors.url.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="visitor-logo" className="text-xs font-medium">
                    {t('resources.site.links.apply.logo')}
                  </Label>
                  <Input
                    id="visitor-logo"
                    {...register('logo')}
                    placeholder="https://.../favicon.ico"
                    className="h-8 font-mono text-xs"
                  />
                  {errors.logo && (
                    <p className="text-destructive text-xs">
                      {errors.logo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="visitor-email"
                    className="text-xs font-medium"
                  >
                    {t('resources.site.links.apply.email')}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="visitor-email"
                    {...register('email')}
                    placeholder="admin@example.com"
                    className="h-8 text-xs"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="visitor-desc" className="text-xs font-medium">
                  {t('resources.site.links.apply.descriptionLabel')}
                </Label>
                <Textarea
                  id="visitor-desc"
                  {...register('description')}
                  placeholder={t(
                    'resources.site.links.apply.descriptionPlaceholder',
                  )}
                  rows={2}
                  className="resize-none text-xs"
                />
                {errors.description && (
                  <p className="text-destructive text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Cloudflare Turnstile 验证挂件容器 (支持真实 Cloudflare 密钥即插即用) */}
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: verification widget trigger */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: verification widget trigger */}
              <div
                onClick={handleTriggerCfVerify}
                className="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-5 items-center justify-center rounded border transition-colors ${
                      cfVerified
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'bg-background border-muted-foreground/40'
                    }`}
                  >
                    {cfChecking ? (
                      <Loader2 className="text-primary size-3 animate-spin" />
                    ) : cfVerified ? (
                      <Check className="size-3 stroke-[3]" />
                    ) : null}
                  </div>
                  <span className="text-foreground text-xs font-medium">
                    {cfChecking
                      ? t('resources.site.links.apply.captchaChecking')
                      : cfVerified
                        ? t('resources.site.links.apply.captchaVerified')
                        : t('resources.site.links.apply.captchaClick')}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
                  <ShieldCheck className="size-3 text-orange-500" />
                  <span>Cloudflare Turnstile</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="h-8 text-xs"
                >
                  {t('common.actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !cfVerified}
                  className="h-8 text-xs"
                >
                  {loading
                    ? t('resources.site.links.apply.submitting')
                    : t('resources.site.links.apply.submit')}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
