import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { siteService } from '../../service'
import type {
  FriendLink,
  FriendLinkFormValues,
  FriendLinkGuidelines,
  FriendLinkGuidelinesFormValues,
  FriendLinkStatus,
} from '../../types'
import { GuidelinesDialog } from './guidelines-dialog'
import { LinkDialog } from './link-dialog'
import { RejectDialog } from './reject-dialog'

export function LinkTable() {
  const { t } = useTranslation()
  const [links, setLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all',
  )

  // Guidelines state
  const [guidelines, setGuidelines] = useState<FriendLinkGuidelines | null>(
    null,
  )
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [guidelinesLoading, setGuidelinesLoading] = useState(false)

  // Create / Edit modal
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<FriendLink | null>(null)
  const [rejectLoading, setRejectLoading] = useState(false)

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<FriendLink | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Backlink verification states
  const [checkingMap, setCheckingMap] = useState<Record<string, boolean>>({})
  const [batchChecking, setBatchChecking] = useState(false)
  const [weeklyStatus, setWeeklyStatus] = useState<{
    needsCheck: boolean
    lastCheckedAt: string | null
  }>({
    needsCheck: false,
    lastCheckedAt: null,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [data, g] = await Promise.all([
        siteService.getFriendLinks(),
        siteService.getFriendLinkGuidelines(),
      ])
      setLinks(data)
      setGuidelines(g)
      setWeeklyStatus(siteService.getWeeklyLinkCheckStatus())
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySingle = async (link: FriendLink) => {
    setCheckingMap((prev) => ({ ...prev, [link.id]: true }))
    try {
      const res = await siteService.verifyFriendLink(link.id)
      if (res.backlinkStatus === 'verified') {
        notify.success(
          t('resources.site.links.toasts.verifyPassed', {
            name: link.name,
            details:
              res.backlinkDetails ||
              t('resources.site.links.toasts.verifyPassedFallback'),
          }),
        )
      } else if (res.backlinkStatus === 'missing') {
        notify.warning(
          t('resources.site.links.toasts.verifyMissing', {
            name: link.name,
            details: res.backlinkDetails,
          }),
        )
      } else {
        notify.error(
          t('resources.site.links.toasts.verifyFailed', {
            name: link.name,
            details: res.backlinkDetails,
          }),
        )
      }
      await loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.links.toasts.checkFailed'))
    } finally {
      setCheckingMap((prev) => ({ ...prev, [link.id]: false }))
    }
  }

  const handleBatchVerify = async () => {
    setBatchChecking(true)
    notify.info(t('resources.site.links.toasts.batchCheckStarted'))
    try {
      const stats = await siteService.verifyAllFriendLinks()
      notify.success(
        t('resources.site.links.toasts.batchCheckDone', {
          total: stats.total,
          verified: stats.verified,
          missing: stats.missing,
          failed: stats.failed,
        }),
      )
      await loadData()
    } catch {
      notify.error(t('resources.site.links.toasts.batchCheckFailed'))
    } finally {
      setBatchChecking(false)
    }
  }

  const handleSaveGuidelines = async (
    values: FriendLinkGuidelinesFormValues,
  ) => {
    setGuidelinesLoading(true)
    try {
      const updated = await siteService.updateFriendLinkGuidelines(values)
      setGuidelines(updated)
      notify.success(t('resources.site.links.toasts.guidelinesUpdated'))
      setGuidelinesOpen(false)
    } catch {
      notify.error(t('resources.site.links.toasts.guidelinesSaveFailed'))
    } finally {
      setGuidelinesLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadData()
  }, [])

  const filteredLinks = useMemo(() => {
    if (tab === 'all') return links
    return links.filter((l) => l.status === tab)
  }, [links, tab])

  const pendingCount = useMemo(
    () => links.filter((l) => l.status === 'pending').length,
    [links],
  )
  const approvedCount = useMemo(
    () => links.filter((l) => l.status === 'approved').length,
    [links],
  )
  const rejectedCount = useMemo(
    () => links.filter((l) => l.status === 'rejected').length,
    [links],
  )

  const handleApprove = async (link: FriendLink) => {
    try {
      await siteService.approveFriendLink(link.id)
      notify.success(
        t('resources.site.links.toasts.approved', { name: link.name }),
      )
      await loadData()
    } catch {
      notify.error(t('resources.site.links.toasts.approveFailed'))
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return
    setRejectLoading(true)
    try {
      await siteService.rejectFriendLink(rejectTarget.id, reason)
      notify.success(
        t('resources.site.links.toasts.rejected', { name: rejectTarget.name }),
      )
      setRejectTarget(null)
      await loadData()
    } catch {
      notify.error(t('resources.site.links.toasts.rejectFailed'))
    } finally {
      setRejectLoading(false)
    }
  }

  const handleSaveDialog = async (values: FriendLinkFormValues) => {
    setDialogLoading(true)
    try {
      if (editingLink) {
        await siteService.saveFriendLink({ ...values, id: editingLink.id })
        notify.success(
          t('resources.site.links.toasts.saved', { name: values.name }),
        )
      } else {
        await siteService.saveFriendLink(values)
        notify.success(
          t('resources.site.links.toasts.created', { name: values.name }),
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await siteService.deleteFriendLink(deleteTarget.id)
      notify.success(
        t('resources.site.links.toasts.deleted', { name: deleteTarget.name }),
      )
      setDeleteTarget(null)
      await loadData()
    } catch {
      notify.error(t('resources.site.shared.deleteFailed'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusBadge = (status: FriendLinkStatus, reason?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600"
          >
            <CheckCircle2 className="size-3" />
            {t('common.status.approved')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/20 bg-amber-500/10 text-xs text-amber-600"
          >
            <Clock className="size-3" />
            {t('common.status.pending')}
          </Badge>
        )
      case 'rejected':
        return (
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="gap-1 border-rose-500/20 bg-rose-500/10 text-xs text-rose-600"
            >
              <XCircle className="size-3" />
              {t('common.status.rejected')}
            </Badge>
            {reason && (
              <span className="text-muted-foreground text-xs" title={reason}>
                ({reason})
              </span>
            )}
          </div>
        )
    }
  }

  const getBacklinkBadge = (item: FriendLink) => {
    if (checkingMap[item.id]) {
      return (
        <Badge
          variant="outline"
          className="animate-pulse gap-1 border-blue-500/20 bg-blue-500/10 text-xs text-blue-600"
        >
          <RefreshCw className="size-3 animate-spin" />
          {t('resources.site.links.backlink.checking')}
        </Badge>
      )
    }

    switch (item.backlinkStatus) {
      case 'verified':
        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600"
              title={
                item.backlinkDetails ||
                t('resources.site.links.backlink.okTitle')
              }
            >
              <ShieldCheck className="size-3" />
              {t('resources.site.links.backlink.verified')}
            </Badge>
            {item.lastCheckedAt && (
              <div className="text-muted-foreground font-mono text-xs">
                {item.lastCheckedAt.slice(0, 10)}
              </div>
            )}
          </div>
        )
      case 'missing':
        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/20 bg-amber-500/10 text-xs text-amber-600"
              title={
                item.backlinkDetails ||
                t('resources.site.links.backlink.missingTitle')
              }
            >
              <AlertCircle className="size-3" />
              {t('resources.site.links.backlink.missing')}
            </Badge>
            {item.lastCheckedAt && (
              <div className="text-muted-foreground font-mono text-xs">
                {item.lastCheckedAt.slice(0, 10)}
              </div>
            )}
          </div>
        )
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-rose-500/20 bg-rose-500/10 text-xs text-rose-600"
            title={
              item.backlinkDetails ||
              t('resources.site.links.backlink.failedTitle')
            }
          >
            <XCircle className="size-3" />
            {t('resources.site.links.backlink.failed')}
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground gap-1 text-xs"
          >
            {t('resources.site.links.backlink.unverified')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b p-4 pb-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Link2 className="text-primary size-4" />
                {t('resources.site.links.title')}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t('resources.site.links.description')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchVerify}
                disabled={batchChecking}
                className="h-8 gap-1.5 border-blue-200 text-xs text-blue-600 hover:bg-blue-50 dark:border-blue-900/40 dark:hover:bg-blue-950/40"
                title={
                  weeklyStatus.lastCheckedAt
                    ? t('resources.site.links.weekly.lastChecked', {
                        date: weeklyStatus.lastCheckedAt.slice(0, 10),
                      })
                    : t('resources.site.links.weekly.neverChecked')
                }
              >
                <RefreshCw
                  className={`size-3.5 ${batchChecking ? 'animate-spin' : ''}`}
                />
                <span>
                  {batchChecking
                    ? t('resources.site.links.weekly.checking')
                    : t('resources.site.links.weekly.run')}
                </span>
                {weeklyStatus.needsCheck && (
                  <span className="size-1.5 animate-ping rounded-full bg-amber-500" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setGuidelinesOpen(true)}
                className="h-8 gap-1.5 text-xs"
              >
                <BookOpen className="size-3.5" />
                {t('resources.site.links.actions.editGuidelines')}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingLink(null)
                  setDialogOpen(true)
                }}
                className="h-8 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                {t('resources.site.links.actions.add')}
              </Button>
            </div>
          </div>

          <div className="pt-3">
            <Tabs
              value={tab}
              onValueChange={(val) => setTab(val as typeof tab)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="all" className="px-3 text-xs">
                  {t('resources.site.links.tabs.all', { total: links.length })}
                </TabsTrigger>
                <TabsTrigger value="pending" className="px-3 text-xs">
                  {t('common.status.pending')}
                  {pendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 bg-amber-500/20 px-1.5 py-0 text-xs text-amber-700 dark:text-amber-400"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="px-3 text-xs">
                  {t('resources.site.links.tabs.approved', {
                    total: approvedCount,
                  })}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="px-3 text-xs">
                  {t('resources.site.links.tabs.rejected', {
                    total: rejectedCount,
                  })}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-muted-foreground py-10 text-center text-xs">
              {t('resources.site.links.loading')}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-xs">
                {t('resources.site.links.empty')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.site')}
                    </th>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.url')}
                    </th>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.intro')}
                    </th>
                    <th className="px-4 py-3 text-center">
                      {t('resources.site.links.columns.weight')}
                    </th>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.status')}
                    </th>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.backlink')}
                    </th>
                    <th className="px-4 py-3">
                      {t('resources.site.links.columns.appliedAt')}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t('common.labels.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLinks.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-muted flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                            {item.logo ? (
                              <img
                                src={item.logo}
                                alt={item.name}
                                className="size-full object-contain"
                                onError={(e) => {
                                  // Fallback to globe icon
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Globe className="text-muted-foreground size-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="text-foreground font-semibold">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 hover:underline"
                        >
                          {item.url}
                          <ExternalLink className="size-3" />
                        </a>
                      </td>

                      <td className="max-w-xs px-4 py-3">
                        <div
                          className="text-muted-foreground truncate"
                          title={item.description}
                        >
                          {item.description || '-'}
                        </div>
                        {item.email && (
                          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                            <Mail className="size-3" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center font-mono">
                        {item.sort}
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(item.status, item.rejectReason)}
                      </td>

                      <td className="px-4 py-3">{getBacklinkBadge(item)}</td>

                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-emerald-300 px-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                onClick={() => handleApprove(item)}
                              >
                                {t('resources.site.links.actions.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-rose-300 px-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                onClick={() => setRejectTarget(item)}
                              >
                                {t('resources.site.links.actions.reject')}
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 px-1.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
                            title={t(
                              'resources.site.links.actions.checkTooltip',
                            )}
                            disabled={checkingMap[item.id]}
                            onClick={() => handleVerifySingle(item)}
                          >
                            <ShieldCheck
                              className={`size-3.5 ${checkingMap[item.id] ? 'animate-spin' : ''}`}
                            />
                            <span className="hidden text-xs xl:inline">
                              {t('resources.site.links.actions.check')}
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                            title={t('common.actions.edit')}
                            onClick={() => {
                              setEditingLink(item)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                            title={t('common.actions.delete')}
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <LinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        onSubmit={handleSaveDialog}
        loading={dialogLoading}
      />

      {/* 驳回理由弹窗 */}
      <RejectDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        link={rejectTarget}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />

      {/* 删除确认弹窗 */}
      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('resources.site.links.delete.title')}
        content={t('resources.site.links.delete.description', {
          name: deleteTarget?.name,
        })}
        confirmText={t('common.actions.confirmDelete')}
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      />

      {/* 互换准则配置弹窗 */}
      <GuidelinesDialog
        open={guidelinesOpen}
        onOpenChange={setGuidelinesOpen}
        guidelines={guidelines}
        onSubmit={handleSaveGuidelines}
        loading={guidelinesLoading}
      />
    </div>
  )
}
