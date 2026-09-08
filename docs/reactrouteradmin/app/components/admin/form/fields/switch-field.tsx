import { Controller, useFormContext } from 'react-hook-form'
import { AdminSwitch } from '../../primitives/admin-switch'

export interface SwitchFieldProps {
  name: string
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function SwitchField({
  name,
  label,
  description,
  disabled,
  className,
}: SwitchFieldProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={`space-y-1.5 ${className || ''}`}>
          <AdminSwitch
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
