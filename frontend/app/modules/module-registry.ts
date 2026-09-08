import type { AdminApp } from '~/core/extensions/extension.types'
import type { AdminModule } from './module.types'

export class AdminModuleRegistry {
  private readonly modules = new Map<string, AdminModule>()

  constructor(initialModules: readonly AdminModule[] = []) {
    for (const module of initialModules) {
      this.register(module)
    }
  }

  register(module: AdminModule): void {
    const id = module.id.trim()
    if (!id) throw new Error('Admin module id cannot be empty')
    if (this.modules.has(id)) {
      throw new Error(`Admin module already registered: ${id}`)
    }
    this.modules.set(id, module)
  }

  get(id: string): AdminModule | undefined {
    return this.modules.get(id)
  }

  getAll(): AdminModule[] {
    return Array.from(this.modules.values())
  }

  bootstrap(app: AdminApp): void {
    for (const module of this.modules.values()) {
      module.register(app)
    }
  }

  clear(): void {
    this.modules.clear()
  }
}
