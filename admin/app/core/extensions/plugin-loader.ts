import type {
  PluginFrontendModule,
  RuntimePluginDescriptor,
} from './plugin.types'

export class PluginLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PluginLoadError'
  }
}

export function validatePluginCompatibility(
  descriptor: RuntimePluginDescriptor,
  expectedApiVersion: string,
  coreVersion = '1.0.0',
): void {
  if (!descriptor.trusted) {
    throw new PluginLoadError('untrusted plugin frontend')
  }
  if (descriptor.apiVersion !== expectedApiVersion) {
    throw new PluginLoadError(
      `unsupported plugin api version: ${descriptor.apiVersion}`,
    )
  }
  if (
    descriptor.coreRequires &&
    !satisfiesCoreVersion(descriptor.coreRequires, coreVersion)
  ) {
    throw new PluginLoadError(
      `plugin requires an incompatible Core version: ${descriptor.coreRequires}`,
    )
  }
}

function satisfiesCoreVersion(requirement: string, current: string): boolean {
  const required = parseVersion(requirement)
  const actual = parseVersion(current)
  if (!required || !actual) return false
  if (requirement.trim().startsWith('^'))
    return actual[0] === required[0] && compareVersion(actual, required) >= 0
  if (requirement.trim().startsWith('~'))
    return (
      actual[0] === required[0] &&
      actual[1] === required[1] &&
      compareVersion(actual, required) >= 0
    )
  if (requirement.trim().startsWith('>='))
    return compareVersion(actual, required) >= 0
  return compareVersion(actual, required) === 0
}

function parseVersion(value: string): [number, number, number] | undefined {
  const match = value.match(/(\d+)\.(\d+)\.(\d+)/)
  if (!match) return undefined
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function compareVersion(
  left: [number, number, number],
  right: [number, number, number],
): number {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index] ? 1 : -1
  }
  return 0
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
