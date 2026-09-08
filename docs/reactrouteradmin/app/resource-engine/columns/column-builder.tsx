import type { ColumnDef, RowData } from '@tanstack/react-table'
import type { ParseKeys } from 'i18next'
import { Check, X } from 'lucide-react'
import type React from 'react'
import { AdminBadge } from '~/components/admin/primitives/admin-badge'
import { DataTableColumnHeader } from '~/components/admin/table/data-table-column-header'
import { i18n } from '~/core/i18n'
import { cn } from '~/lib/utils'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    searchable?: boolean
  }
}

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default'

export type ColumnAlign = 'left' | 'center' | 'right'

export type ColumnKind =
  | 'text'
  | 'number'
  | 'badge'
  | 'date'
  | 'boolean'
  | 'image'
  | 'custom'

type Accessor<T> = (row: T) => unknown

interface ColumnBuilderState {
  id?: string
  label?: string
  labelKey?: ParseKeys<'translation'>
  sortable: boolean
  searchable: boolean
  align?: ColumnAlign
  className?: string
}

export class ColumnBuilder<T> {
  private readonly kind: ColumnKind
  private readonly field?: string
  private readonly accessorFn?: Accessor<T>
  private state: ColumnBuilderState
  private badgeVariants: Record<string, BadgeStatus> = {}
  private customRender?: (row: T) => React.ReactNode

  constructor(kind: ColumnKind, field?: string, accessor?: Accessor<T>) {
    this.kind = kind
    this.field = field
    this.accessorFn = accessor
    this.state = { sortable: false, searchable: false }
  }

  id(id: string): this {
    this.state.id = id
    return this
  }

  label(label: string): this {
    this.state.label = label
    return this
  }

  labelKey(labelKey: ParseKeys<'translation'>): this {
    this.state.labelKey = labelKey
    return this
  }

  sortable(): this {
    this.state.sortable = true
    return this
  }

  searchable(): this {
    this.state.searchable = true
    return this
  }

  align(align: ColumnAlign): this {
    this.state.align = align
    return this
  }

  className(className: string): this {
    this.state.className = className
    return this
  }

  variants(map: Record<string, BadgeStatus>): this {
    this.badgeVariants = map
    return this
  }

  render(fn: (row: T) => React.ReactNode): this {
    this.customRender = fn
    return this
  }

  build(): ColumnDef<T, unknown> {
    const { kind, field, state } = this
    const columnId = state.id ?? field ?? 'column'
    const title = () =>
      state.labelKey ? i18n.t(state.labelKey) : (state.label ?? columnId)

    const alignmentClass =
      state.align === 'center'
        ? 'text-center'
        : state.align === 'right'
          ? 'text-right'
          : undefined

    return {
      id: columnId,
      ...(field ? { accessorKey: field } : {}),
      ...(this.accessorFn ? { accessorFn: this.accessorFn } : {}),
      enableSorting: state.sortable,
      meta: { searchable: state.searchable },
      header: (ctx) =>
        state.sortable ? (
          <DataTableColumnHeader
            column={ctx.column}
            title={title()}
            className={alignmentClass}
          />
        ) : (
          <span className={cn(alignmentClass, state.className)}>{title()}</span>
        ),
      cell: (ctx) => {
        const row = ctx.row.original
        const value =
          this.accessorFn?.(row) ??
          (field ? (row as Record<string, unknown>)[field] : undefined)

        if (kind === 'custom') {
          return this.customRender ? this.customRender(row) : null
        }

        return (
          <span className={cn(alignmentClass, state.className)}>
            {renderValue(kind, value, this.badgeVariants)}
          </span>
        )
      },
    }
  }
}

function renderValue(
  kind: ColumnKind,
  value: unknown,
  badgeVariants: Record<string, BadgeStatus>,
): React.ReactNode {
  if (kind === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-emerald-600" />
    ) : (
      <X className="text-muted-foreground h-4 w-4" />
    )
  }

  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>
  }

  if (kind === 'image') {
    return (
      <img
        src={String(value)}
        className="h-8 w-8 rounded object-cover"
        alt=""
      />
    )
  }

  if (kind === 'badge') {
    const text = String(value)
    return (
      <AdminBadge status={badgeVariants[text] ?? 'default'}>{text}</AdminBadge>
    )
  }

  if (kind === 'date') {
    const date = new Date(String(value))
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString(i18n.language)
  }

  if (kind === 'number') {
    return Number(value).toLocaleString(i18n.language)
  }

  return String(value)
}

export const column = {
  text: <T,>(field: string) => new ColumnBuilder<T>('text', field),
  number: <T,>(field: string) => new ColumnBuilder<T>('number', field),
  badge: <T,>(field: string) => new ColumnBuilder<T>('badge', field),
  date: <T,>(field: string) => new ColumnBuilder<T>('date', field),
  boolean: <T,>(field: string) => new ColumnBuilder<T>('boolean', field),
  image: <T,>(field: string) => new ColumnBuilder<T>('image', field),
  custom: <T,>(field?: string, accessor?: Accessor<T>) =>
    new ColumnBuilder<T>('custom', field, accessor),
}
