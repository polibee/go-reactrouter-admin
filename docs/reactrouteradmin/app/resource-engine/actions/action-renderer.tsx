import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { AdminConfirmDialog } from '~/components/admin/overlay/admin-confirm-dialog'
import { Button } from '~/components/ui/button'
import { Can } from '~/core/permissions/can'
import { cn } from '~/lib/utils'
import type { ActionScope, ResourceActionConfig } from './action-builder'
import { DEFAULT_LABEL_KEYS } from './action-builder'

export interface ResourceActionsProps {
  actions: ResourceActionConfig[]
  scope: ActionScope
  row?: unknown
  selectedCount?: number
  className?: string
  onAction?: (
    action: ResourceActionConfig,
    row?: unknown,
  ) => void | Promise<void>
}

function resolveLabel(config: ResourceActionConfig, t: TFunction): string {
  if (config.label) return config.label
  if (config.labelKey) return t(config.labelKey)
  return t(DEFAULT_LABEL_KEYS[config.kind])
}

interface ActionConfirmDialogProps {
  config: ResourceActionConfig
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function ActionConfirmDialog({
  config,
  onOpenChange,
  onConfirm,
}: ActionConfirmDialogProps) {
  const { t } = useTranslation()
  const isDelete = config.kind === 'delete'
  const title = config.confirmTitleKey
    ? t(config.confirmTitleKey)
    : t(
        isDelete
          ? 'common.confirm.deleteItemTitle'
          : 'common.confirm.defaultTitle',
      )
  const description = config.confirmDescriptionKey
    ? t(config.confirmDescriptionKey)
    : t(
        isDelete
          ? 'common.confirm.deleteDescription'
          : 'common.confirm.defaultDescription',
      )

  return (
    <AdminConfirmDialog
      open
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={isDelete ? 'destructive' : 'default'}
      onConfirm={onConfirm}
    />
  )
}

interface ActionTriggerProps {
  config: ResourceActionConfig
  row?: unknown
  disabled: boolean
  onClick: () => void
}

function ActionTrigger({ config, row, disabled, onClick }: ActionTriggerProps) {
  const { t } = useTranslation()
  const Icon = config.icon
  const label = resolveLabel(config, t)
  const size = config.size ?? 'default'
  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </>
  )

  if (config.to && !config.confirm) {
    return (
      <Button asChild variant={config.variant} size={size} disabled={disabled}>
        <Link to={config.to(row)}>{content}</Link>
      </Button>
    )
  }

  return (
    <Button
      variant={config.variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </Button>
  )
}

export function ResourceActions({
  actions,
  scope,
  row,
  selectedCount,
  className,
  onAction,
}: ResourceActionsProps) {
  const navigate = useNavigate()
  const [pending, setPending] = useState<ResourceActionConfig | null>(null)

  const scoped = actions.filter((item) => item.scope === scope)
  if (scoped.length === 0) return null

  const disabled = scope === 'bulk' && (selectedCount ?? 0) === 0
  const target = scope === 'bulk' ? undefined : row

  const runAction = (config: ResourceActionConfig) => {
    if (config.onAction) {
      void config.onAction(target)
    } else {
      void onAction?.(config, target)
    }
    if (config.to) navigate(config.to(row))
  }

  const handleClick = (config: ResourceActionConfig) => {
    if (config.confirm) setPending(config)
    else runAction(config)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {scoped.map((config, index) => (
        <Can
          key={config.id ?? `${config.kind}-${index}`}
          permission={config.permission}
        >
          <ActionTrigger
            config={config}
            row={row}
            disabled={disabled}
            onClick={() => handleClick(config)}
          />
        </Can>
      ))}
      {pending ? (
        <ActionConfirmDialog
          config={pending}
          onOpenChange={(open) => {
            if (!open) setPending(null)
          }}
          onConfirm={() => runAction(pending)}
        />
      ) : null}
    </div>
  )
}
