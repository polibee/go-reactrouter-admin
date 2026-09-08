// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import { i18n } from '~/core/i18n'
import { SYSTEM_PERMISSION_GROUPS } from './permissions'
import { roleRepository, type IRoleRepository } from './repository'
import type { PermissionGroup, Role, RoleFormValues } from './types'

export class RoleService {
  constructor(private repo: IRoleRepository = roleRepository) {}

  async getRoles(): Promise<Role[]> {
    return this.repo.findAll()
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.repo.findById(id)
  }

  async createRole(values: RoleFormValues): Promise<Role> {
    const existing = await this.repo.findByCode(values.code)
    if (existing) {
      throw new Error(
        i18n.t('resources.roles.errors.codeTaken', { code: values.code }),
      )
    }

    return this.repo.create({
      name: values.name,
      code: values.code,
      description: values.description,
      // Engine forms may omit the matrix value; default to empty
      permissions: values.permissions ?? [],
    })
  }

  async updateRole(id: string, values: RoleFormValues): Promise<Role> {
    const target = await this.repo.findById(id)
    if (!target) {
      throw new Error(i18n.t('resources.roles.errors.notFound'))
    }

    if (values.code !== target.code) {
      const codeTaken = await this.repo.findByCode(values.code)
      if (codeTaken && codeTaken.id !== id) {
        throw new Error(
          i18n.t('resources.roles.errors.codeTakenByOther', {
            code: values.code,
          }),
        )
      }
    }

    return this.repo.update(id, {
      name: values.name,
      code: values.code,
      description: values.description,
      // Engine forms may omit the matrix value; keep existing permissions
      permissions: values.permissions ?? target.permissions,
    })
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.repo.delete(id)
  }

  async deleteRoles(
    ids: string[],
  ): Promise<{ successCount: number; skippedCount: number }> {
    let successCount = 0
    let skippedCount = 0

    for (const id of ids) {
      try {
        const deleted = await this.repo.delete(id)
        if (deleted) {
          successCount++
        } else {
          skippedCount++
        }
      } catch {
        skippedCount++
      }
    }

    return { successCount, skippedCount }
  }

  getPermissionGroups(): readonly PermissionGroup[] {
    return SYSTEM_PERMISSION_GROUPS
  }
}

export const roleService = new RoleService()
