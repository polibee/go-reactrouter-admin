import type { ParseKeys } from 'i18next'
import type React from 'react'

export type ActionKind = 'create' | 'edit' | 'view' | 'delete' | 'custom'

export type ActionScope = 'page' | 'row' | 'bulk'

export interface ResourceActionConfig {
  kind: ActionKind
  scope: ActionScope
  id?: string
  label?: string
  labelKey?: ParseKeys<'translation'>
  icon?: React.ComponentType<{ className?: string }>
  permission?: string
  confirm?: boolean
  confirmTitleKey?: ParseKeys<'translation'>
  confirmDescriptionKey?: ParseKeys<'translation'>
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onAction?: (row?: unknown) => void | Promise<void>
  to?: (row?: unknown) => string
}

export const DEFAULT_LABEL_KEYS: Record<
  ActionKind,
  ParseKeys<'translation'>
> = {
  create: 'common.actions.create',
  edit: 'common.actions.edit',
  view: 'common.actions.view',
  delete: 'common.actions.delete',
  custom: 'common.actions.apply',
}

const DEFAULT_VARIANTS: Record<ActionKind, ResourceActionConfig['variant']> = {
  create: 'default',
  edit: 'ghost',
  view: 'ghost',
  delete: 'ghost',
  custom: 'outline',
}

export class ActionBuilder {
  private readonly kind: ActionKind
  private readonly defaultScope: ActionScope
  private scopeOverride?: ActionScope
  private config: Omit<ResourceActionConfig, 'kind' | 'scope'> = {}

  constructor(kind: ActionKind, scope: ActionScope) {
    this.kind = kind
    this.defaultScope = scope
  }

  scope(scope: ActionScope): this {
    this.scopeOverride = scope
    return this
  }

  id(id: string): this {
    this.config.id = id
    return this
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  labelKey(labelKey: ParseKeys<'translation'>): this {
    this.config.labelKey = labelKey
    return this
  }

  icon(icon: React.ComponentType<{ className?: string }>): this {
    this.config.icon = icon
    return this
  }

  permission(permission: string): this {
    this.config.permission = permission
    return this
  }

  confirm(confirm = true): this {
    this.config.confirm = confirm
    return this
  }

  confirmTitleKey(key: ParseKeys<'translation'>): this {
    this.config.confirmTitleKey = key
    return this
  }

  confirmDescriptionKey(key: ParseKeys<'translation'>): this {
    this.config.confirmDescriptionKey = key
    return this
  }

  variant(variant: NonNullable<ResourceActionConfig['variant']>): this {
    this.config.variant = variant
    return this
  }

  size(size: NonNullable<ResourceActionConfig['size']>): this {
    this.config.size = size
    return this
  }

  onAction(fn: (row?: unknown) => void | Promise<void>): this {
    this.config.onAction = fn
    return this
  }

  to(fn: (row?: unknown) => string): this {
    this.config.to = fn
    return this
  }

  build(): ResourceActionConfig {
    const scope = this.scopeOverride ?? this.defaultScope
    const defaultLabelKey =
      this.kind === 'delete' && scope === 'bulk'
        ? ('common.actions.bulkDelete' as ParseKeys<'translation'>)
        : DEFAULT_LABEL_KEYS[this.kind]
    return {
      kind: this.kind,
      scope,
      labelKey: defaultLabelKey,
      variant: DEFAULT_VARIANTS[this.kind],
      ...this.config,
    }
  }
}

export const action = {
  create: () => new ActionBuilder('create', 'page'),
  edit: () => new ActionBuilder('edit', 'row'),
  view: () => new ActionBuilder('view', 'row'),
  delete: () => new ActionBuilder('delete', 'row'),
  bulkDelete: () => new ActionBuilder('delete', 'bulk'),
  custom: (kind: ActionKind = 'custom', scope: ActionScope = 'page') =>
    new ActionBuilder(kind, scope),
}
