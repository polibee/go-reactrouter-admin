// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import { i18n } from '~/core/i18n'
import type { Role } from './types'

export interface IRoleRepository {
  findAll(): Promise<Role[]>
  findById(id: string): Promise<Role | null>
  findByCode(code: string): Promise<Role | null>
  create(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>
  update(
    id: string,
    data: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Role>
  delete(id: string): Promise<boolean>
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-super-admin',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统最高掌控者，拥有全平台所有功能与数据的完全控制权',
    permissions: ['*'],
    isSystem: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'role-admin',
    name: '系统管理员',
    code: 'admin',
    description: '负责用户管理、角色分配及全站运营参数配置',
    permissions: [
      'users.view',
      'users.create',
      'users.update',
      'users.delete',
      'roles.view',
      'roles.create',
      'roles.update',
      'site.view',
      'site.pages',
      'site.navigation',
      'site.widgets',
      'site.operations',
      'site.links',
      'settings.view',
      'settings.update',
    ],
    isSystem: true,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'role-editor',
    name: '内容主编',
    code: 'editor',
    description: '负责 CMS 资讯专栏、文章发布、审核及读者查看',
    permissions: [
      'articles.view',
      'articles.create',
      'articles.update',
      'articles.delete',
      'users.view',
    ],
    isSystem: false,
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'role-viewer',
    name: '访客审计员',
    code: 'viewer',
    description: '仅拥有各业务模块的数据浏览与只读审计权限',
    permissions: ['users.view', 'roles.view', 'articles.view', 'settings.view'],
    isSystem: false,
    createdAt: '2025-01-04T00:00:00.000Z',
    updatedAt: '2025-01-04T00:00:00.000Z',
  },
]

const STORAGE_KEY = 'admin_roles_data'

export class RoleRepository implements IRoleRepository {
  private memoryRoles: Role[] = [...DEFAULT_ROLES]

  private getStoredRoles(): Role[] {
    if (typeof window === 'undefined') {
      return this.memoryRoles
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROLES))
        return DEFAULT_ROLES
      }
      return JSON.parse(stored) as Role[]
    } catch {
      return this.memoryRoles
    }
  }

  private persist(roles: Role[]): void {
    this.memoryRoles = roles
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
      } catch (err) {
        console.error('Failed to persist roles into localStorage', err)
      }
    }
  }

  async findAll(): Promise<Role[]> {
    return this.getStoredRoles()
  }

  async findById(id: string): Promise<Role | null> {
    const roles = this.getStoredRoles()
    return roles.find((r) => r.id === id) || null
  }

  async findByCode(code: string): Promise<Role | null> {
    const roles = this.getStoredRoles()
    return roles.find((r) => r.code === code) || null
  }

  async create(
    data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Role> {
    const roles = this.getStoredRoles()
    const now = new Date().toISOString()
    const newRole: Role = {
      ...data,
      id: `role-${Date.now()}`,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    }

    const nextRoles = [newRole, ...roles]
    this.persist(nextRoles)
    return newRole
  }

  async update(
    id: string,
    data: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Role> {
    const roles = this.getStoredRoles()
    const target = roles.find((r) => r.id === id)
    if (!target) {
      throw new Error(`Role with id "${id}" not found`)
    }

    const updated: Role = {
      ...target,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    const nextRoles = roles.map((r) => (r.id === id ? updated : r))
    this.persist(nextRoles)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const roles = this.getStoredRoles()
    const target = roles.find((r) => r.id === id)
    if (!target) {
      return false
    }

    // 系统内置角色不可删除
    if (target.isSystem) {
      throw new Error(
        i18n.t('resources.roles.errors.systemProtected', {
          name: target.name,
        }),
      )
    }

    const nextRoles = roles.filter((r) => r.id !== id)
    this.persist(nextRoles)
    return true
  }
}

export const roleRepository = new RoleRepository()
