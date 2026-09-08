// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import { i18n } from '~/core/i18n'
import { type IUserRepository, userRepository } from './repository'
import type { User, UserFormData } from './types'

export class UserService {
  constructor(private repo: IUserRepository = userRepository) {}

  async listUsers(): Promise<User[]> {
    return this.repo.findAll()
  }

  async getUser(id: string): Promise<User | null> {
    return this.repo.findById(id)
  }

  async createUser(data: UserFormData): Promise<User> {
    // Validate uniqueness of email
    const all = await this.repo.findAll()
    const exists = all.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase(),
    )
    if (exists) {
      throw new Error(
        i18n.t('resources.users.errors.emailInUse', { email: data.email }),
      )
    }
    return this.repo.create(data)
  }

  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    if (data.email) {
      const all = await this.repo.findAll()
      const conflict = all.some(
        (u) =>
          u.id !== id && u.email.toLowerCase() === data.email?.toLowerCase(),
      )
      if (conflict) {
        throw new Error(
          i18n.t('resources.users.errors.emailTakenByOther', {
            email: data.email,
          }),
        )
      }
    }
    return this.repo.update(id, data)
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repo.delete(id)
  }

  async bulkDeleteUsers(ids: string[]): Promise<number> {
    return this.repo.deleteMany(ids)
  }
}

export const userService = new UserService()
