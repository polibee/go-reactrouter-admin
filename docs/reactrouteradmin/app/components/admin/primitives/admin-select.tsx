import type React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface AdminSelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options?: SelectOption[]
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function AdminSelect({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  options,
  disabled,
  className,
  children,
}: AdminSelectProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('common.admin.selectPlaceholder')
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {options
          ? options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))
          : children}
      </SelectContent>
    </Select>
  )
}
