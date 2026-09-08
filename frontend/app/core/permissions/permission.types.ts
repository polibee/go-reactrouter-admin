export interface PermissionRule {
  id: string
  name: string
  description?: string
  resource: string
  action: 'view' | 'create' | 'update' | 'delete' | 'manage' | string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}
