import type { ColumnDef } from '@tanstack/react-table'
import type React from 'react'
import type { ResourceActionConfig } from '../actions/action-builder'
import type { ResourceFieldConfig } from '../fields/field-builder'

export interface ResourceNavigation {
  group?: string
  groupKey?: string
  sort?: number
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number | (() => string | number | undefined)
  hidden?: boolean | (() => boolean)
}

export interface ResourcePermissions {
  view?: string
  create?: string
  update?: string
  delete?: string
  [key: string]: string | undefined
}

export interface ResourceRouteConfig {
  path?: string
  listPath?: string
  createPath?: string
  editPath?: string
  viewPath?: string
}

export interface ResourceListQuery {
  page?: number
  pageSize?: number
  search?: string
}

export interface ResourceListResult<T> {
  items: T[]
  total?: number
}

/**
 * The only data seam for resources. Providers must not leak backend details
 * (Goravel, REST endpoints, database shapes) into the engine; future
 * Fullstack / REST / Goravel providers implement this same contract.
 * See docs/重构文档补充.md §五.
 */
export interface ResourceDataProvider<T = unknown> {
  list?: (query?: ResourceListQuery) => Promise<ResourceListResult<T>>
  find?: (id: string) => Promise<T | null>
  create?: (values: Record<string, unknown>) => Promise<T>
  update?: (id: string, values: Record<string, unknown>) => Promise<T>
  delete?: (id: string) => Promise<boolean | void>
}

export interface ResourceCustomPage {
  path: string
  component: React.ComponentType
}

export interface AdminResource<T = unknown> {
  name: string
  label: string
  labelKey?: string
  singularLabel?: string
  singularLabelKey?: string
  pluralLabel?: string
  pluralLabelKey?: string
  icon?: React.ComponentType<{ className?: string }>
  navigation?: ResourceNavigation
  permissions?: ResourcePermissions
  routes?: ResourceRouteConfig
  columns?: ColumnDef<T, unknown>[]
  fields?: ResourceFieldConfig[]
  actions?: ResourceActionConfig[]
  data?: ResourceDataProvider<T>
  customPages?: ResourceCustomPage[]
  meta?: Record<string, unknown>
  _model?: T
}

export type ResourceConfig<T = unknown> = AdminResource<T>
