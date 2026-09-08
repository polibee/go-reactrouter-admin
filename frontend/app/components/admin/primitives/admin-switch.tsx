import type React from 'react'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'

export interface AdminSwitchProps extends React.ComponentProps<typeof Switch> {
  label?: string
  description?: string
}

export function AdminSwitch({
  label,
  description,
  id,
  className,
  ...props
}: AdminSwitchProps) {
  const switchId =
    id ||
    (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  if (!label) {
    return <Switch id={switchId} className={className} {...props} />
  }

  return (
    <div className="flex items-center space-x-3">
      <Switch id={switchId} className={className} {...props} />
      <div className="space-y-0.5">
        <Label
          htmlFor={switchId}
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
