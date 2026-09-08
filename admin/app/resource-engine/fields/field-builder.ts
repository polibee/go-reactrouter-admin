import type { ParseKeys } from 'i18next'
import type React from 'react'

export interface CustomFieldRenderProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'switch'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'custom'

export interface FieldOption {
  label: string
  value: string
}

export interface ResourceFieldConfig {
  kind: FieldType
  name: string
  label?: string
  labelKey?: ParseKeys<'translation'>
  required?: boolean
  placeholder?: string
  placeholderKey?: ParseKeys<'translation'>
  description?: string
  options?: FieldOption[]
  min?: number
  max?: number
  rows?: number
  accept?: string
  disabled?: boolean
  render?: React.ComponentType<CustomFieldRenderProps>
}

export class FieldBuilder {
  private readonly kind: FieldType
  private readonly name: string
  private config: Omit<ResourceFieldConfig, 'kind' | 'name'> = {}

  constructor(kind: FieldType, name: string) {
    this.kind = kind
    this.name = name
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  labelKey(labelKey: ParseKeys<'translation'>): this {
    this.config.labelKey = labelKey
    return this
  }

  required(): this {
    this.config.required = true
    return this
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder
    return this
  }

  placeholderKey(placeholderKey: ParseKeys<'translation'>): this {
    this.config.placeholderKey = placeholderKey
    return this
  }

  description(description: string): this {
    this.config.description = description
    return this
  }

  options(options: FieldOption[]): this {
    this.config.options = options
    return this
  }

  min(min: number): this {
    this.config.min = min
    return this
  }

  max(max: number): this {
    this.config.max = max
    return this
  }

  rows(rows: number): this {
    this.config.rows = rows
    return this
  }

  accept(accept: string): this {
    this.config.accept = accept
    return this
  }

  disabled(): this {
    this.config.disabled = true
    return this
  }

  render(component: React.ComponentType<CustomFieldRenderProps>): this {
    this.config.render = component
    return this
  }

  build(): ResourceFieldConfig {
    return { kind: this.kind, name: this.name, ...this.config }
  }
}

export const field = {
  text: (name: string) => new FieldBuilder('text', name),
  textarea: (name: string) => new FieldBuilder('textarea', name),
  email: (name: string) => new FieldBuilder('email', name),
  password: (name: string) => new FieldBuilder('password', name),
  number: (name: string) => new FieldBuilder('number', name),
  select: (name: string) => new FieldBuilder('select', name),
  switch: (name: string) => new FieldBuilder('switch', name),
  checkbox: (name: string) => new FieldBuilder('checkbox', name),
  date: (name: string) => new FieldBuilder('date', name),
  file: (name: string) => new FieldBuilder('file', name),
  custom: (name: string) => new FieldBuilder('custom', name),
}

export function buildFieldDefaultValues(
  fields: ResourceFieldConfig[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const config of fields) {
    if (config.kind === 'switch' || config.kind === 'checkbox') {
      values[config.name] = false
    } else if (config.kind === 'custom') {
      values[config.name] = []
    } else {
      values[config.name] = ''
    }
  }
  return values
}
