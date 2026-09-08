import { z } from 'zod'
import { i18n } from '~/core/i18n'

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export const userFormSchema = z.object({
  name: z
    .string()
    .min(2, i18n.t('validation.minLength', { count: 2 }))
    .max(50, i18n.t('validation.maxLength', { count: 50 })),
  email: z.string().email(i18n.t('validation.invalidEmail')),
  role: z.enum(['super_admin', 'admin', 'manager', 'user']),
  status: z.enum(['active', 'inactive', 'suspended']),
  bio: z
    .string()
    .max(200, i18n.t('validation.maxLength', { count: 200 }))
    .optional(),
})

export type UserFormData = z.infer<typeof userFormSchema>
