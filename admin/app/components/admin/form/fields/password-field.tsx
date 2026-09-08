import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

export interface PasswordFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function PasswordField({
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  className,
}: PasswordFieldProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.admin.passwordLabel')
  const resolvedPlaceholder =
    placeholder ?? t('common.admin.passwordPlaceholder')
  const { control } = useFormContext()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={`space-y-1.5 ${className || ''}`}>
          {resolvedLabel && (
            <Label htmlFor={name} className="text-sm font-medium">
              {resolvedLabel}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          <div className="relative flex w-full items-center">
            <div className="text-muted-foreground pointer-events-none absolute left-3">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id={name}
              type={showPassword ? 'text' : 'password'}
              {...field}
              value={field.value ?? ''}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              className={cn(
                'pr-10 pl-9',
                fieldState.error &&
                  'border-destructive focus-visible:ring-destructive',
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground absolute right-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {description && !fieldState.error && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
          {fieldState.error && (
            <p className="text-destructive text-xs font-medium">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}
