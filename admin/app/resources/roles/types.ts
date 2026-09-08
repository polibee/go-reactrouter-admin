import { z } from 'zod'
import { i18n } from '~/core/i18n'

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  isSystem?: boolean
  createdAt: string
  updatedAt: string
}

export interface PermissionDefinition {
  code: string
  name: string
  description?: string
  module: string
}

export interface PermissionGroup {
  module: string
  title: string
  description?: string
  permissions: readonly PermissionDefinition[]
}

export const roleFormSchema = z.object({
  name: z.string().min(2, i18n.t('resources.roles.validation.nameMin')),
  code: z
    .string()
    .min(2, i18n.t('resources.roles.validation.codeMin'))
    .regex(/^[a-zA-Z0-9_-]+$/, i18n.t('resources.roles.validation.codeFormat')),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
