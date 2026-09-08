import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { AdminSelect, type SelectOption } from '../../primitives/admin-select'

export interface SelectFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  options: SelectOption[]
  className?: string
}

export function SelectField({
  name,
  label,
  placeholder,
  description,
  required,
  disabled,
  options,
  className,
}: SelectFieldProps) {
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
          <AdminSelect
            value={field.value ?? ''}
            onValueChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            options={options}
            className={fieldState.error ? 'border-destructive' : ''}
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
