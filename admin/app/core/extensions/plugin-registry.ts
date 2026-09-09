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
        descriptor.state === 'enabled' &&
        descriptor.loadState !== 'failed',
    )
  }

  disable(id: string): void {
    const descriptor = this.plugins.get(id)
    if (!descriptor) return
    this.plugins.set(id, {
      ...descriptor,
      enabled: false,
      state: 'disabled',
      loadState: 'idle',
      loadError: undefined,
    })
  }

  markLoading(id: string): void {
    this.updateLoadState(id, 'loading')
  }

  markLoaded(id: string): void {
    this.updateLoadState(id, 'loaded')
  }

  markFailed(id: string, message: string): void {
    const descriptor = this.plugins.get(id)
    if (!descriptor) return
    this.plugins.set(id, {
      ...descriptor,
      loadState: 'failed',
      loadError: message,
    })
  }

  private updateLoadState(
    id: string,
    loadState: NonNullable<RuntimePluginDescriptor['loadState']>,
  ): void {
    const descriptor = this.plugins.get(id)
    if (!descriptor) return
    this.plugins.set(id, { ...descriptor, loadState, loadError: undefined })
  }

  clear(): void {
    this.plugins.clear()
  }
}

export const pluginRegistry = new PluginRegistry()
