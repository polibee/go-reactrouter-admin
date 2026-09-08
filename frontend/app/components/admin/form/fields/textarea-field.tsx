import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { AdminTextarea } from '../../primitives/admin-textarea'

export interface TextareaFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  className?: string
}

export function TextareaField({
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  rows = 3,
  className,
}: TextareaFieldProps) {
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
          <AdminTextarea
            id={name}
            {...field}
            value={field.value ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            error={fieldState.error?.message}
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
