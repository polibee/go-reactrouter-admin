import {
  AlertCircle,
  BellRing,
  Edit2,
  Megaphone,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminConfirmDialog, notify } from '~/components/admin'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { siteService } from '../../service'
import type {
  AnnouncementType,
  SiteAnnouncement,
  SiteAnnouncementFormValues,
} from '../../types'
import { AnnouncementDialog } from './announcement-dialog'

export function AnnouncementManager() {
  const { t } = useTranslation()
  const [list, setList] = useState<SiteAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SiteAnnouncement | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SiteAnnouncement | null>(
    null,
  )
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await siteService.getAnnouncements()
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (item: SiteAnnouncement, enabled: boolean) => {
    try {
      await siteService.toggleAnnouncement(item.id, enabled)
      setList(list.map((a) => (a.id === item.id ? { ...a, enabled } : a)))
      notify.success(
        t(
          enabled
            ? 'resources.site.operations.announcements.toasts.enabled'
            : 'resources.site.operations.announcements.toasts.disabled',
        ),
      )
    } catch {
      notify.error(t('resources.site.shared.statusUpdateFailed'))
    }
  }

  const handleQuickUpdate = async (item: SiteAnnouncement) => {
    setSavingId(item.id)
    try {
      await siteService.updateAnnouncement(item.id, item)
      notify.success(
        t('resources.site.operations.announcements.toasts.quickSaved', {
          name: item.title,
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
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: SiteAnnouncement) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleSaveDialog = async (values: SiteAnnouncementFormValues) => {
    setDialogLoading(true)
    try {
      if (editingItem) {
        await siteService.saveAnnouncement({ ...values, id: editingItem.id })
        notify.success(
          t('resources.site.operations.announcements.toasts.updated', {
            name: values.title,
          }),
        )
      } else {
        await siteService.saveAnnouncement(values)
        notify.success(
          t('resources.site.operations.announcements.toasts.created', {
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
      await siteService.deleteAnnouncement(deleteTarget.id)
      notify.success(
        t('resources.site.operations.announcements.toasts.deleted', {
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

  const getTypeMeta = (type: AnnouncementType) => {
    switch (type) {
      case 'banner':
        return {
          label: t(
            'resources.site.operations.announcements.types.banner.label',
          ),
          icon: Megaphone,
          desc: t('resources.site.operations.announcements.types.banner.desc'),
          badge: t(
            'resources.site.operations.announcements.types.banner.badge',
          ),
        }
      case 'modal':
        return {
          label: t('resources.site.operations.announcements.types.modal.label'),
          icon: MessageSquare,
          desc: t('resources.site.operations.announcements.types.modal.desc'),
          badge: t('resources.site.operations.announcements.types.modal.badge'),
        }
      case 'corner':
        return {
          label: t(
            'resources.site.operations.announcements.types.corner.label',
          ),
          icon: BellRing,
          desc: t('resources.site.operations.announcements.types.corner.desc'),
          badge: t(
            'resources.site.operations.announcements.types.corner.badge',
          ),
        }
      case 'marquee':
        return {
          label: t(
            'resources.site.operations.announcements.types.marquee.label',
          ),
          icon: Sparkles,
          desc: t('resources.site.operations.announcements.types.marquee.desc'),
          badge: t(
            'resources.site.operations.announcements.types.marquee.badge',
          ),
        }
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-8 text-center text-xs">
        {t('resources.site.operations.announcements.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-foreground text-sm font-semibold">
            {t('resources.site.operations.announcements.title')}
          </h3>
          <p className="text-muted-foreground text-xs">
            {t('resources.site.operations.announcements.description')}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="h-8 gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          {t('resources.site.operations.announcements.actions.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-muted-foreground text-xs">
              {t('resources.site.operations.announcements.empty')}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenCreate}
              className="mt-3 text-xs"
            >
              {t('resources.site.operations.announcements.actions.addFirst')}
            </Button>
          </div>
        ) : (
          list.map((item) => {
            const meta = getTypeMeta(item.type)
            const Icon = meta.icon

            return (
              <Card key={item.id} className="border shadow-xs">
                <CardHeader className="flex flex-col justify-between gap-3 space-y-0 border-b p-4 pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        {meta.label}
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {meta.badge}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        {meta.desc}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`switch-${item.id}`}
                        checked={item.enabled}
                        onCheckedChange={(checked) =>
                          handleToggle(item, checked)
                        }
                      />
                      <Label
                        htmlFor={`switch-${item.id}`}
                        className="cursor-pointer text-xs font-medium"
                      >
                        {item.enabled
                          ? t('common.status.enabled')
                          : t('common.status.disabled')}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickUpdate(item)}
                      disabled={savingId === item.id}
                      className="h-8 text-xs"
                    >
                      {savingId === item.id
                        ? t('common.actions.saving')
                        : t(
                            'resources.site.operations.announcements.quickSave',
                          )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                      title={t(
                        'resources.site.operations.announcements.tooltips.edit',
                      )}
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      title={t(
                        'resources.site.operations.announcements.tooltips.delete',
                      )}
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t(
                          'resources.site.operations.announcements.fields.title',
                        )}
                      </Label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          setList(
                            list.map((a) =>
                              a.id === item.id
                                ? { ...a, title: e.target.value }
                                : a,
                            ),
                          )
                        }
                        className="h-8 text-xs"
                        placeholder={t(
                          'resources.site.operations.announcements.fields.titlePlaceholder',
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t(
                            'resources.site.operations.announcements.fields.linkText',
                          )}
                        </Label>
                        <Input
                          value={item.linkText || ''}
                          onChange={(e) =>
                            setList(
                              list.map((a) =>
                                a.id === item.id
                                  ? { ...a, linkText: e.target.value }
                                  : a,
                              ),
                            )
                          }
                          className="h-8 text-xs"
                          placeholder={t(
                            'resources.site.operations.announcements.fields.linkTextPlaceholder',
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t(
                            'resources.site.operations.announcements.fields.linkUrl',
                          )}
                        </Label>
                        <Input
                          value={item.linkUrl || ''}
                          onChange={(e) =>
                            setList(
                              list.map((a) =>
                                a.id === item.id
                                  ? { ...a, linkUrl: e.target.value }
                                  : a,
                              ),
                            )
                          }
                          className="h-8 font-mono text-xs"
                          placeholder="/p/about"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">
                      {t(
                        'resources.site.operations.announcements.fields.content',
                      )}
                    </Label>
                    <Textarea
                      value={item.content}
                      onChange={(e) =>
                        setList(
                          list.map((a) =>
                            a.id === item.id
                              ? { ...a, content: e.target.value }
                              : a,
                          ),
                        )
                      }
                      rows={2}
                      className="resize-none text-xs"
                      placeholder={t(
                        'resources.site.operations.announcements.fields.contentPlaceholder',
                      )}
                    />
                  </div>

                  {item.type === 'modal' && (
                    <div className="text-muted-foreground flex items-center gap-2 pt-1 text-xs">
                      <AlertCircle className="size-3.5 text-amber-600" />
                      <span>
                        {t('resources.site.operations.announcements.modalNote')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSubmit={handleSaveDialog}
        loading={dialogLoading}
      />

      {/* 删除二次确认弹窗 */}
      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('resources.site.operations.announcements.delete.title')}
        content={t(
          'resources.site.operations.announcements.delete.description',
          {
            name: deleteTarget?.title,
          },
        )}
        confirmText={t('common.actions.confirmDelete')}
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  )
}
