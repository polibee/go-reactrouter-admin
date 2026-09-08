import { Controller, useFormContext } from 'react-hook-form'
import { AdminCheckbox } from '../../primitives/admin-checkbox'

export interface CheckboxFieldProps {
  name: string
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function CheckboxField({
  name,
  label,
  description,
  disabled,
  className,
}: CheckboxFieldProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={`space-y-1.5 ${className || ''}`}>
          <AdminCheckbox
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            label={label}
            description={description}
          />
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
