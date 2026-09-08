import type React from 'react'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'

export interface AdminCheckboxProps extends React.ComponentProps<
  typeof Checkbox
> {
  label?: string
  description?: string
}

export function AdminCheckbox({
  label,
  description,
  id,
  className,
  ...props
}: AdminCheckboxProps) {
  const checkboxId =
    id ||
    (label ? `check-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  if (!label) {
    return <Checkbox id={checkboxId} className={className} {...props} />
  }

  return (
    <div className="flex items-start space-x-3">
      <Checkbox id={checkboxId} className={className} {...props} />
      <div className="space-y-0.5 leading-none">
        <Label
          htmlFor={checkboxId}
          className="cursor-pointer text-sm font-medium"
        >
          {label}
        </Label>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>
    </div>
  )
}
