import type { PluginFrontendModule } from './plugin.types'

export class PluginLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PluginLoadError'
  }
}

function resolveEntrypoint(entrypoint: string): string {
  if (typeof window === 'undefined') {
    throw new PluginLoadError(
      'Plugin frontend loading requires a browser runtime',
    )
  }

  const url = new URL(entrypoint, window.location.origin)
  if (url.origin !== window.location.origin) {
    throw new PluginLoadError('Plugin frontend must use the current origin')
  }

  return url.href
}

export async function loadPluginFrontend(
  entrypoint: string,
): Promise<PluginFrontendModule> {
  const url = resolveEntrypoint(entrypoint)
  let loaded: unknown

  try {
    loaded = await import(/* @vite-ignore */ url)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new PluginLoadError(`Failed to load plugin frontend: ${reason}`)
  }

  if (!loaded || typeof loaded !== 'object' || !('register' in loaded)) {
    throw new PluginLoadError('Plugin frontend must export register(app)')
  }

  const module = loaded as Partial<PluginFrontendModule>
  if (typeof module.register !== 'function') {
    throw new PluginLoadError(
      'Plugin frontend register export must be a function',
    )
  }

  return module as PluginFrontendModule
}
