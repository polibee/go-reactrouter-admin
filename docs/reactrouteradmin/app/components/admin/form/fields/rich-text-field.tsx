import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { RichTextEditor } from '~/components/ui/rich-text-editor'

export interface RichTextFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  minHeight?: string
  className?: string
}

export function RichTextField({
  name,
  label,
  placeholder,
  description,
  required,
  minHeight = '380px',
  disabled = false,
  className,
}: RichTextFieldProps) {
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
          <RichTextEditor
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder={placeholder}
            minHeight={minHeight}
            disabled={disabled}
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
