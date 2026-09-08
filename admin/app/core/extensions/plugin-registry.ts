import type { RuntimePluginDescriptor } from './plugin.types'

export class PluginRegistry {
  private readonly plugins = new Map<string, RuntimePluginDescriptor>()

  register(descriptor: RuntimePluginDescriptor): void {
    this.plugins.set(descriptor.id, descriptor)
  }

  get(id: string): RuntimePluginDescriptor | undefined {
    return this.plugins.get(id)
  }

  getAll(): RuntimePluginDescriptor[] {
    return Array.from(this.plugins.values())
  }

  getEnabled(): RuntimePluginDescriptor[] {
    return this.getAll().filter(
      (descriptor) =>
        descriptor.enabled &&
        descriptor.trusted &&
        descriptor.state === 'enabled',
    )
  }

  clear(): void {
    this.plugins.clear()
  }
}

export const pluginRegistry = new PluginRegistry()
