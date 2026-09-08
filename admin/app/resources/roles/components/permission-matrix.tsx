import { CheckCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import type { CustomFieldRenderProps } from '~/resource-engine/fields/field-builder'
import { ALL_PERMISSION_CODES, SYSTEM_PERMISSION_GROUPS } from '../permissions'

export function PermissionMatrix({
  value,
  onChange,
  disabled = false,
}: CustomFieldRenderProps) {
  const { t } = useTranslation()
  const selectedPermissions: string[] = Array.isArray(value)
    ? (value as string[])
    : []
  const isSuperAdmin = selectedPermissions.includes('*')

  const togglePermission = (code: string) => {
    if (disabled) return
    if (isSuperAdmin) {
      // Expand the wildcard into regular permissions minus the toggled one
      onChange([...ALL_PERMISSION_CODES].filter((c) => c !== code))
      return
    }

    if (selectedPermissions.includes(code)) {
      onChange(selectedPermissions.filter((c) => c !== code))
    } else {
      onChange([...selectedPermissions, code])
    }
  }

  const toggleGroup = (moduleKey: string) => {
    if (disabled) return
    const group = SYSTEM_PERMISSION_GROUPS.find((g) => g.module === moduleKey)
    if (!group) return

    const groupCodes: string[] = group.permissions.map((p) => p.code)
    const currentCodes = isSuperAdmin
      ? [...ALL_PERMISSION_CODES]
      : [...selectedPermissions]
    const allGroupSelected = groupCodes.every((code) =>
      currentCodes.includes(code),
    )

    if (allGroupSelected) {
      onChange(currentCodes.filter((code) => !groupCodes.includes(code)))
    } else {
      onChange(Array.from(new Set([...currentCodes, ...groupCodes])))
    }
  }

  const selectAll = () => {
    if (disabled) return
    onChange(ALL_PERMISSION_CODES)
  }

  const clearAll = () => {
    if (disabled) return
    onChange([])
  }

  const effectivePermissions = isSuperAdmin
    ? ALL_PERMISSION_CODES
    : selectedPermissions

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 flex flex-col justify-between gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium">
            {t('resources.roles.matrix.title')}
          </span>
          {isSuperAdmin ? (
            <Badge
              variant="default"
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {t('resources.roles.matrix.superBadge')}
            </Badge>
          ) : (
            <Badge variant="secondary">
              {t('common.pagination.selectedOf', {
                selected: effectivePermissions.length,
                total: ALL_PERMISSION_CODES.length,
              })}
            </Badge>
          )}
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 size-3.5" />
              {t('common.actions.selectAll')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive h-8 text-xs"
            >
              <XCircle className="mr-1 size-3.5" />
              {t('resources.roles.matrix.clearAll')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SYSTEM_PERMISSION_GROUPS.map((group) => {
          const groupCodes = group.permissions.map((p) => p.code)
          const allSelected =
            isSuperAdmin ||
            groupCodes.every((code) => selectedPermissions.includes(code))

          return (
            <Card key={group.module} className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {t(group.title)}
                  </CardTitle>
                  {group.description && (
                    <CardDescription className="mt-0.5 text-xs">
                      {t(group.description)}
                    </CardDescription>
                  )}
                </div>

                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroup(group.module)}
                    className="text-primary h-7 px-2 text-xs font-normal"
                  >
                    {allSelected
                      ? t('resources.roles.matrix.deselectGroup')
                      : t('resources.roles.matrix.selectGroup')}
                  </Button>
                )}
              </CardHeader>

              <CardContent className="space-y-3 p-4">
                {group.permissions.map((perm) => {
                  const isChecked =
                    isSuperAdmin || selectedPermissions.includes(perm.code)

                  return (
                    <div
                      key={perm.code}
                      className="hover:bg-accent/40 flex items-start space-x-2.5 rounded-md p-1.5 transition-colors"
                    >
                      <Checkbox
                        id={`perm-${perm.code}`}
                        checked={isChecked}
                        disabled={disabled}
                        onCheckedChange={() => togglePermission(perm.code)}
                        className="mt-0.5"
                      />
                      <div className="grid gap-0.5 leading-none">
                        <Label
                          htmlFor={`perm-${perm.code}`}
                          className="cursor-pointer text-xs font-medium"
                        >
                          {t(perm.name)}
                          <span className="text-muted-foreground ml-1.5 font-mono text-xs font-normal">
                            ({perm.code})
                          </span>
                        </Label>
                        {perm.description && (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {t(perm.description)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
