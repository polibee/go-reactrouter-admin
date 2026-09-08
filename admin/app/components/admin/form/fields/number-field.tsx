import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { AdminInput } from '../../primitives/admin-input'

export interface NumberFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  className?: string
}

export function NumberField({
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  min,
  max,
  step = 1,
  className,
}: NumberFieldProps) {
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
            type="number"
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            error={fieldState.error?.message}
            value={field.value ?? ''}
            onChange={(e) => {
              const val =
                e.target.value === '' ? undefined : Number(e.target.value)
              field.onChange(val)
            }}
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
