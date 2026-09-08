import { registerStaticNavigation } from '~/core/navigation/static-navigation'
import { registerAllResources } from '~/resources'
import { AdminModuleRegistry } from './module-registry'
import type { AdminModule } from './module.types'

const coreAdminModule: AdminModule = {
  id: 'core-admin',
  register() {
    registerStaticNavigation()
    registerAllResources()
  },
}

export const adminModuleRegistry = new AdminModuleRegistry([coreAdminModule])

export function registerAdminModule(module: AdminModule): void {
  adminModuleRegistry.register(module)
}

export { AdminModuleRegistry } from './module-registry'
export type { AdminModule } from './module.types'
