import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { i18n } from '~/core/i18n'
import { AdminEmpty } from '../feedback/admin-empty'
import { AdminLoading } from '../feedback/admin-loading'
import { AdminBulkActions } from './data-table-bulk-actions'
import { AdminTablePagination } from './data-table-pagination'
import { AdminTableToolbar } from './data-table-toolbar'

export interface AdminTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  searchKey?: string
  searchPlaceholder?: string
  enableRowSelection?: boolean
  onBulkDelete?: (selectedRows: TData[]) => void | Promise<void>
  toolbarActions?: React.ReactNode
  toolbarFilters?: React.ReactNode
  bulkActions?: React.ReactNode
  onRowClick?: (row: TData) => void
  emptyTitle?: string
  emptyDescription?: string
  manualPagination?: boolean
  pageCount?: number
}

export function createSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={i18n.t('common.actions.selectAll')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={i18n.t('common.actions.selectRow')}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

export function AdminTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder,
  enableRowSelection = false,
  onBulkDelete,
  toolbarActions,
  toolbarFilters,
  bulkActions,
  onRowClick,
  emptyTitle,
  emptyDescription,
  manualPagination,
  pageCount,
}: AdminTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const tableColumns = React.useMemo(() => {
    if (enableRowSelection) {
      const hasSelect = columns.some((c) => c.id === 'select')
      if (!hasSelect) {
        return [createSelectColumn<TData>(), ...columns]
      }
    }
    return columns
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection,
    manualPagination,
    pageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original)

  return (
    <div className="w-full space-y-4">
      <AdminTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        actions={toolbarActions}
        filters={toolbarFilters}
      />

      {enableRowSelection && (
        <AdminBulkActions
          selectedCount={selectedRows.length}
          onClearSelection={() => table.resetRowSelection()}
          onBulkDelete={
            onBulkDelete ? () => onBulkDelete(selectedRows) : undefined
          }
          actions={bulkActions}
        />
      )}

      <div className="bg-card overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-48 text-center"
                >
                  <AdminLoading text={t('common.actions.loadingTable')} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-48 text-center"
                >
                  <AdminEmpty
                    title={emptyTitle || t('common.messages.noMatchingData')}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminTablePagination table={table} />
    </div>
  )
}
