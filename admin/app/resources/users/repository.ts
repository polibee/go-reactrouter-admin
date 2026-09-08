// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import type { User, UserFormData } from './types'

export interface IUserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  create(data: UserFormData): Promise<User>
  update(id: string, data: Partial<UserFormData>): Promise<User>
  delete(id: string): Promise<boolean>
  deleteMany(ids: string[]): Promise<number>
}

const initialMockUsers: User[] = [
  {
    id: 'usr-1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'super_admin',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    bio: '平台超级管理员',
    createdAt: '2025-01-10 09:30',
    updatedAt: '2025-02-15 14:20',
  },
  {
    id: 'usr-2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'admin',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    bio: '业务系统主管',
    createdAt: '2025-01-12 11:00',
    updatedAt: '2025-02-10 16:45',
  },
  {
    id: 'usr-3',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'manager',
    status: 'inactive',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    bio: '内容运营团队经理',
    createdAt: '2025-01-18 15:20',
    updatedAt: '2025-01-20 18:00',
  },
  {
    id: 'usr-4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: 'user',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    bio: '普通平台用户',
    createdAt: '2025-02-01 10:15',
    updatedAt: '2025-02-01 10:15',
  },
  {
    id: 'usr-5',
    name: '钱七',
    email: 'qianqi@example.com',
    role: 'user',
    status: 'suspended',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    bio: '违规账号已封禁',
    createdAt: '2025-02-05 13:40',
    updatedAt: '2025-02-12 09:10',
  },
]

class LocalUserRepository implements IUserRepository {
  private users: User[] = [...initialMockUsers]
  private storageKey = 'admin_mock_users'

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (saved) {
          this.users = JSON.parse(saved)
        } else {
          this.saveToStorage()
        }
      } catch (e) {
        console.error('Failed to load mock users from localStorage', e)
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.users))
      } catch (e) {
        console.error('Failed to save mock users to localStorage', e)
      }
    }
  }

  async findAll(): Promise<User[]> {
    return [...this.users]
  }

  async findById(id: string): Promise<User | null> {
    const found = this.users.find((u) => u.id === id)
    return found ? { ...found } : null
  }

  async create(data: UserFormData): Promise<User> {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const newUser: User = {
      id: `usr-${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    this.users.unshift(newUser)
    this.saveToStorage()
    return newUser
  }

  async update(id: string, data: Partial<UserFormData>): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) {
      throw new Error(`User with id ${id} not found`)
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updated: User = {
      ...this.users[index],
      ...data,
      updatedAt: now,
    }
    this.users[index] = updated
    this.saveToStorage()
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return false
    this.users.splice(index, 1)
    this.saveToStorage()
    return true
  }

  async deleteMany(ids: string[]): Promise<number> {
    const beforeCount = this.users.length
    this.users = this.users.filter((u) => !ids.includes(u.id))
    this.saveToStorage()
    return beforeCount - this.users.length
  }
}

export const userRepository = new LocalUserRepository()
