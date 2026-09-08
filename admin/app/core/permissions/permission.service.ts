import type { AuthUser } from '~/core/auth/auth.types'

export function hasPermission(
  user: AuthUser | null,
  permission?: string,
): boolean {
  if (!permission) return true
  if (!user) return false
  if (user.permissions.includes('*')) return true
  if (user.permissions.includes(permission)) return true

  let namespace = permission
  while (namespace.includes('.')) {
    namespace = namespace.slice(0, namespace.lastIndexOf('.'))
    if (user.permissions.includes(`${namespace}.*`)) return true
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
