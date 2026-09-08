import type { Table } from '@tanstack/react-table'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'

export interface AdminTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  actions?: React.ReactNode
  filters?: React.ReactNode
}

export function AdminTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  globalFilter,
  onGlobalFilterChange,
  actions,
  filters,
}: AdminTableToolbarProps<TData>) {
  const { t } = useTranslation()
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t('common.admin.searchPlaceholder')
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter

  return (
    <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchKey ? (
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder={resolvedSearchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-9 pl-8"
            />
          </div>
        ) : onGlobalFilterChange ? (
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder={resolvedSearchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              className="h-9 pl-8"
            />
          </div>
        ) : null}

        {filters}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              if (onGlobalFilterChange) onGlobalFilterChange('')
            }}
            className="text-muted-foreground h-9 px-2 text-sm lg:px-3"
          >
            {t('common.actions.reset')}
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {actions}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-9 lg:flex"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('common.actions.columnSettings')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>
              {t('common.actions.showColumns')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== 'undefined' &&
                  column.getCanHide(),
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {(column.columnDef.header as string) || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
