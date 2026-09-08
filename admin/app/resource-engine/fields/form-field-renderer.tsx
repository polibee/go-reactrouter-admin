import type React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CheckboxField } from '~/components/admin/form/fields/checkbox-field'
import { EmailField } from '~/components/admin/form/fields/email-field'
import { NumberField } from '~/components/admin/form/fields/number-field'
import { PasswordField } from '~/components/admin/form/fields/password-field'
import { SelectField } from '~/components/admin/form/fields/select-field'
import { SwitchField } from '~/components/admin/form/fields/switch-field'
import { TextField } from '~/components/admin/form/fields/text-field'
import { TextareaField } from '~/components/admin/form/fields/textarea-field'
import { FormSection } from '~/components/admin/form/form-section'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { i18n } from '~/core/i18n'
import type { ResourceFieldConfig } from './field-builder'

interface FieldRendererProps {
  config: ResourceFieldConfig
}

function FieldRenderer({ config }: FieldRendererProps) {
  const { control } = useFormContext()
  const label = config.labelKey
    ? i18n.t(config.labelKey)
    : (config.label ?? config.name)
  const placeholder = config.placeholderKey
    ? i18n.t(config.placeholderKey)
    : config.placeholder

  if (config.kind === 'custom' && config.render) {
    const CustomRender = config.render
    return (
      <Controller
        name={config.name}
        control={control}
        render={({ field }) => (
          <CustomRender
            value={field.value}
            onChange={field.onChange}
            disabled={config.disabled}
          />
        )}
      />
    )
  }

  if (config.kind === 'select') {
    return (
      <SelectField
        name={config.name}
        label={label}
        placeholder={placeholder}
        description={config.description}
        required={config.required}
        disabled={config.disabled}
        options={config.options ?? []}
      />
    )
  }

  if (config.kind === 'switch') {
    return (
      <SwitchField
        name={config.name}
        label={label}
        description={config.description}
        disabled={config.disabled}
      />
    )
  }

  if (config.kind === 'checkbox') {
    return (
      <CheckboxField
        name={config.name}
        label={label}
        description={config.description}
        disabled={config.disabled}
      />
    )
  }

  if (config.kind === 'date' || config.kind === 'file') {
    const isFile = config.kind === 'file'
    return (
      <Controller
        name={config.name}
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <Label htmlFor={config.name} className="text-sm font-medium">
              {label}
              {config.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={config.name}
              type={config.kind}
              accept={isFile ? config.accept : undefined}
              value={isFile ? undefined : (field.value ?? '')}
              onChange={(event) =>
                field.onChange(
                  isFile ? event.target.files?.[0] : event.target.value,
                )
              }
              disabled={config.disabled}
            />
            {fieldState.error?.message && (
              <p className="text-destructive text-xs">
                {fieldState.error.message}
              </p>
            )}
            {config.description && (
              <p className="text-muted-foreground text-xs">
                {config.description}
              </p>
            )}
          </div>
        )}
      />
    )
  }

  switch (config.kind) {
    case 'textarea':
      return (
        <TextareaField
          name={config.name}
          label={label}
          placeholder={placeholder}
          description={config.description}
          required={config.required}
          disabled={config.disabled}
          rows={config.rows}
        />
      )
    case 'number':
      return (
        <NumberField
          name={config.name}
          label={label}
          placeholder={placeholder}
          description={config.description}
          required={config.required}
          disabled={config.disabled}
          min={config.min}
          max={config.max}
        />
      )
    case 'email':
      return (
        <EmailField
          name={config.name}
          label={label}
          placeholder={placeholder}
          description={config.description}
          required={config.required}
          disabled={config.disabled}
        />
      )
    case 'password':
      return (
        <PasswordField
          name={config.name}
          label={label}
          placeholder={placeholder}
          description={config.description}
          required={config.required}
          disabled={config.disabled}
        />
      )
    default:
      return (
        <TextField
          name={config.name}
          label={label}
          placeholder={placeholder}
          description={config.description}
          required={config.required}
          disabled={config.disabled}
        />
      )
  }
}

export interface FormFieldRendererProps {
  fields: ResourceFieldConfig[]
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function FormFieldRenderer({
  fields,
  title,
  description,
  actions,
  className,
}: FormFieldRendererProps) {
  return (
    <FormSection
      title={title}
      description={description}
      actions={actions}
      className={className}
    >
      {fields.map((config) => (
        <FieldRenderer key={config.name} config={config} />
      ))}
    </FormSection>
  )
}
