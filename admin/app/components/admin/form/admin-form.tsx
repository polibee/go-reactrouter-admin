import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import type React from 'react'
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { ZodType } from 'zod'
import { AdminButton } from '../primitives/admin-button'

export interface AdminFormProps<TFieldValues extends FieldValues> {
  schema?: ZodType<TFieldValues>
  defaultValues?: DefaultValues<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  form?: UseFormReturn<TFieldValues>
  loading?: boolean
  submitText?: string
  submitIcon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  hideDefaultActions?: boolean
  children: React.ReactNode
  className?: string
}

export function AdminForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  form: externalForm,
  loading = false,
  submitText,
  submitIcon = Save,
  actions,
  hideDefaultActions = false,
  children,
  className = 'space-y-4',
}: AdminFormProps<TFieldValues>) {
  const { t } = useTranslation()
  const resolvedSubmitText = submitText ?? t('common.actions.save')
  const internalForm = useForm<TFieldValues>({
    // biome-ignore lint/suspicious/noExplicitAny: zod v4 schema types don't satisfy the resolver's generated generic
    resolver: schema ? zodResolver(schema as any) : undefined,
    defaultValues,
  })

  const form = externalForm || internalForm

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`w-full ${className}`}
        noValidate
      >
        <div className="space-y-4">{children}</div>

        {!hideDefaultActions && (
          <div className="mt-6 flex items-center gap-3 border-t pt-4">
            {actions || (
              <AdminButton type="submit" loading={loading} icon={submitIcon}>
                {resolvedSubmitText}
              </AdminButton>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  )
}
