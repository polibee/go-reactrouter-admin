import type { AdminApp } from '~/core/extensions/extension.types'

/** A compile-time application module owned by the main product. */
export interface AdminModule {
  readonly id: string
  register(app: AdminApp): void
}
