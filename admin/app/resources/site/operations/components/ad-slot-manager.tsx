import { Edit2, LayoutTemplate, MonitorPlay, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminConfirmDialog, notify } from '~/components/admin'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { siteService } from '../../service'
import type { AdType, SiteAdSlot, SiteAdSlotFormValues } from '../../types'
import { AdSlotDialog } from './ad-slot-dialog'

export function AdSlotManager() {
  const { t } = useTranslation()
  const [adSlots, setAdSlots] = useState<SiteAdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<SiteAdSlot | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SiteAdSlot | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await siteService.getAdSlots()
      setAdSlots(data)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (slot: SiteAdSlot, enabled: boolean) => {
    try {
      await siteService.updateAdSlot(slot.id, { enabled })
      setAdSlots(adSlots.map((s) => (s.id === slot.id ? { ...s, enabled } : s)))
      notify.success(
        t(
          enabled
            ? 'resources.site.operations.ads.toasts.enabled'
            : 'resources.site.operations.ads.toasts.disabled',
          { name: slot.title },
        ),
      )
    } catch {
      notify.error(t('resources.site.shared.statusUpdateFailed'))
    }
  }

  const handleQuickSave = async (slot: SiteAdSlot) => {
    setSavingId(slot.id)
    try {
      await siteService.updateAdSlot(slot.id, slot)
      notify.success(
        t('resources.site.operations.ads.toasts.quickSaved', {
          name: slot.title,
        }),
      )
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.shared.saveFailed'))
    } finally {
      setSavingId(null)
    }
  }

  const handleOpenCreate = () => {
    setEditingSlot(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (slot: SiteAdSlot) => {
    setEditingSlot(slot)
    setDialogOpen(true)
  }

  const handleSaveDialog = async (values: SiteAdSlotFormValues) => {
    setDialogLoading(true)
    try {
      if (editingSlot) {
        await siteService.saveAdSlot({ ...values, id: editingSlot.id })
        notify.success(
          t('resources.site.operations.ads.toasts.updated', {
            name: values.title,
          }),
        )
      } else {
        await siteService.saveAdSlot(values)
        notify.success(
          t('resources.site.operations.ads.toasts.created', {
            name: values.title,
          }),
        )
      }
      setDialogOpen(false)
      await loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.shared.saveFailed'))
    } finally {
      setDialogLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await siteService.deleteAdSlot(deleteTarget.id)
      notify.success(
        t('resources.site.operations.ads.toasts.deleted', {
          name: deleteTarget.title,
        }),
      )
      setDeleteTarget(null)
      await loadData()
    } catch {
      notify.error(t('resources.site.shared.deleteFailed'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-8 text-center text-xs">
        {t('resources.site.operations.ads.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/40 flex flex-col justify-between gap-3 rounded-lg border p-3.5 sm:flex-row sm:items-center">
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <MonitorPlay className="text-primary size-4" />
            {t('resources.site.operations.ads.title')}
          </h4>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t('resources.site.operations.ads.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Badge variant="secondary">
            {t('resources.site.operations.ads.count', {
              total: adSlots.length,
            })}
          </Badge>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            {t('resources.site.operations.ads.actions.create')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {adSlots.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-muted-foreground text-xs">
              {t('resources.site.operations.ads.empty')}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenCreate}
              className="mt-3 text-xs"
            >
              {t('resources.site.operations.ads.actions.addFirst')}
            </Button>
          </div>
        ) : (
          adSlots.map((slot) => (
            <Card key={slot.id} className="border shadow-xs">
              <CardHeader className="flex flex-col justify-between gap-3 space-y-0 border-b p-4 pb-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
                    <LayoutTemplate className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      {slot.title}
                      <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                        slot: {slot.slotKey}
                      </span>
                    </CardTitle>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`ad-switch-${slot.id}`}
                      checked={slot.enabled}
                      onCheckedChange={(checked) => handleToggle(slot, checked)}
                    />
                    <Label
                      htmlFor={`ad-switch-${slot.id}`}
                      className="cursor-pointer text-xs font-medium"
                    >
                      {slot.enabled
                        ? t('resources.site.operations.ads.running')
                        : t('resources.site.operations.ads.paused')}
                    </Label>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleQuickSave(slot)}
                    disabled={savingId === slot.id}
                    className="h-8 text-xs"
                  >
                    {savingId === slot.id
                      ? t('common.actions.saving')
                      : t('resources.site.shared.saveChanges')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    title={t('resources.site.operations.ads.tooltips.edit')}
                    onClick={() => handleOpenEdit(slot)}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    title={t('resources.site.operations.ads.tooltips.delete')}
                    onClick={() => setDeleteTarget(slot)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {t('resources.site.operations.ads.fields.adType')}
                    </Label>
                    <Select
                      value={slot.adType}
                      onValueChange={(val) =>
                        setAdSlots(
                          adSlots.map((s) =>
                            s.id === slot.id
                              ? { ...s, adType: val as AdType }
                              : s,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text" className="text-xs">
                          {t('resources.site.operations.ads.adTypes.text')}
                        </SelectItem>
                        <SelectItem value="image" className="text-xs">
                          {t('resources.site.operations.ads.adTypes.image')}
                        </SelectItem>
                        <SelectItem value="html" className="text-xs">
                          {t('resources.site.operations.ads.adTypes.html')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">
                      {t('resources.site.operations.ads.fields.targetUrl')}
                    </Label>
                    <Input
                      value={slot.targetUrl || ''}
                      onChange={(e) =>
                        setAdSlots(
                          adSlots.map((s) =>
                            s.id === slot.id
                              ? { ...s, targetUrl: e.target.value }
                              : s,
                          ),
                        )
                      }
                      className="h-8 font-mono text-xs"
                      placeholder={t(
                        'resources.site.operations.ads.placeholders.targetUrl',
                      )}
                      disabled={slot.adType === 'html'}
                    />
                  </div>
                </div>

                {slot.adType === 'text' && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {t('resources.site.operations.ads.fields.text')}
                    </Label>
                    <Input
                      value={slot.text || ''}
                      onChange={(e) =>
                        setAdSlots(
                          adSlots.map((s) =>
                            s.id === slot.id
                              ? { ...s, text: e.target.value }
                              : s,
                          ),
                        )
                      }
                      className="h-8 text-xs"
                      placeholder={t(
                        'resources.site.operations.ads.placeholders.text',
                      )}
                    />
                  </div>
                )}

                {slot.adType === 'image' && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {t('resources.site.operations.ads.fields.imageUrl')}
                    </Label>
                    <Input
                      value={slot.imageUrl || ''}
                      onChange={(e) =>
                        setAdSlots(
                          adSlots.map((s) =>
                            s.id === slot.id
                              ? { ...s, imageUrl: e.target.value }
                              : s,
                          ),
                        )
                      }
                      className="h-8 font-mono text-xs"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                )}

                {slot.adType === 'html' && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {t('resources.site.operations.ads.fields.html')}
                    </Label>
                    <Input
                      value={slot.htmlContent || ''}
                      onChange={(e) =>
                        setAdSlots(
                          adSlots.map((s) =>
                            s.id === slot.id
                              ? { ...s, htmlContent: e.target.value }
                              : s,
                          ),
                        )
                      }
                      className="h-8 font-mono text-xs"
                      placeholder="<script>...</script>"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      <AdSlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slot={editingSlot}
        onSubmit={handleSaveDialog}
        loading={dialogLoading}
      />

      {/* 删除二次确认弹窗 */}
      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('resources.site.operations.ads.delete.title')}
        content={t('resources.site.operations.ads.delete.description', {
          name: deleteTarget?.title,
        })}
        confirmText={t('common.actions.confirmDelete')}
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  )
}
