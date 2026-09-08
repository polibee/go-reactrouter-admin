import type React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { AdminInput } from '../../primitives/admin-input'

export interface TextFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  leftIcon?: React.ComponentType<{ className?: string }>
  rightIcon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function TextField({
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  leftIcon,
  rightIcon,
  className,
}: TextFieldProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={`space-y-1.5 ${className || ''}`}>
          {label && (
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          <AdminInput
            id={name}
            {...field}
            value={field.value ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            error={fieldState.error?.message}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
          />
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
