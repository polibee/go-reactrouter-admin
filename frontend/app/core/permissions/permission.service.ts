import type { AuthUser } from '~/core/auth/auth.types'

export function hasPermission(
  user: AuthUser | null,
  permission?: string,
): boolean {
  if (!permission) return true
  if (!user) return false
  if (user.permissions.includes('*')) return true
  if (user.permissions.includes(permission)) return true

  const parts = permission.split('.')
  if (parts.length === 2) {
    const [resource] = parts
    if (user.permissions.includes(`${resource}.*`)) return true
  }

  return false
}

export function can(
  user: AuthUser | null,
  action: string,
  resource: string,
): boolean {
  return hasPermission(user, `${resource}.${action}`)
}
