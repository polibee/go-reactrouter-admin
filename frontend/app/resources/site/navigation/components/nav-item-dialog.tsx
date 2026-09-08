import { CornerDownRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
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
import { NameTranslationsInput } from '../../components/name-translations-input'
import type {
  NavLocation,
  SiteNavGroup,
  SiteNavItem,
  SiteNavItemFormValues,
} from '../../types'

export interface NavItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: SiteNavItem | null
  defaultLocation?: NavLocation
  defaultParentId?: string
  defaultGroupId?: string
  groups: SiteNavGroup[]
  parentCandidates: SiteNavItem[]
  onSave: (values: SiteNavItemFormValues & { id?: string }) => Promise<void>
  onOpenCreateGroup?: (location: NavLocation) => void
}

export function NavItemDialog({
  open,
  onOpenChange,
  initialData,
  defaultLocation = 'header',
  defaultParentId,
  defaultGroupId,
  groups,
  parentCandidates,
  onSave,
  onOpenCreateGroup,
}: NavItemDialogProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(initialData)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [location, setLocation] = useState<NavLocation>(defaultLocation)
  const [target, setTarget] = useState<'_self' | '_blank'>('_self')
  const [groupId, setGroupId] = useState<string>('')
  const [parentId, setParentId] = useState<string>('none')
  const [description, setDescription] = useState('')
  const [sort, setSort] = useState(10)
  const [enabled, setEnabled] = useState(true)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Filter groups for current location
  const locationGroups = groups.filter((g) => g.location === location)

  // Filter valid parents: must match location, cannot be itself, and cannot already have a parent (keep 2 levels clean)
  const validParents = parentCandidates.filter(
    (p) =>
      p.location === location &&
      (!initialData || p.id !== initialData.id) &&
      !p.parentId,
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync state when the edited item changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setUrl(initialData.url)
      setLocation(initialData.location)
      setTarget(initialData.target)
      setGroupId(initialData.groupId || '')
      setParentId(initialData.parentId || 'none')
      setDescription(initialData.description || '')
      setSort(initialData.sort)
      setEnabled(initialData.enabled)
      setTranslations(initialData.nameTranslations ?? {})
    } else {
      setTitle('')
      setUrl('')
      setLocation(defaultLocation)
      setTarget('_self')
      setGroupId(defaultGroupId || locationGroups[0]?.id || '')
      setParentId(defaultParentId || 'none')
      setDescription('')
      setSort(10)
      setEnabled(true)
      setTranslations({})
    }
  }, [initialData, defaultLocation, defaultParentId, defaultGroupId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const selectedGroup = groups.find((g) => g.id === groupId)
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        url: url.trim() || (parentId !== 'none' ? '#' : '/'),
        location,
        target,
        groupId: groupId || undefined,
        group: selectedGroup?.name || undefined,
        parentId: parentId !== 'none' ? parentId : undefined,
        description: description.trim() || undefined,
        sort: Number(sort),
        enabled,
        nameTranslations:
          Object.keys(translations).length > 0 ? translations : undefined,
      })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const QUICK_URLS = [
    { label: t('resources.site.navigation.itemDialog.quick.home'), url: '/' },
    {
      label: t('resources.site.navigation.itemDialog.quick.about'),
      url: '/about',
    },
    {
      label: t('resources.site.navigation.itemDialog.quick.terms'),
      url: '/terms',
    },
    {
      label: t('resources.site.navigation.itemDialog.quick.privacy'),
      url: '/privacy',
    },
    {
      label: t('resources.site.navigation.itemDialog.quick.links'),
      url: '/links',
    },
    {
      label: t('resources.site.navigation.itemDialog.quick.users'),
      url: '/admin/users',
    },
    {
      label: t('resources.site.navigation.itemDialog.quick.media'),
      url: '/admin/media',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {parentId !== 'none' && (
              <CornerDownRight className="text-primary size-4" />
            )}
            {isEditing
              ? parentId !== 'none'
                ? t('resources.site.navigation.itemDialog.editChildTitle')
                : t('resources.site.navigation.itemDialog.editMainTitle')
              : parentId !== 'none'
                ? t('resources.site.navigation.itemDialog.createChildTitle')
                : t('resources.site.navigation.itemDialog.createMainTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {parentId !== 'none'
              ? t('resources.site.navigation.itemDialog.childDescription')
              : t('resources.site.navigation.itemDialog.mainDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          {/* 1. 所属位置与父级菜单层级 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                {t('resources.site.navigation.itemDialog.locationLabel')}
              </Label>
              <Select
                value={location}
                onValueChange={(val) => {
                  const nextLoc = val as NavLocation
                  setLocation(nextLoc)
                  setParentId('none')
                  const nextGroups = groups.filter(
                    (g) => g.location === nextLoc,
                  )
                  setGroupId(nextGroups[0]?.id || '')
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="header">
                    {t('resources.site.navigation.locationHeader')}
                  </SelectItem>
                  <SelectItem value="footer">
                    {t('resources.site.navigation.locationFooter')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                {t('resources.site.navigation.itemDialog.parentLabel')}
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="none">
                    {t('resources.site.navigation.itemDialog.parentNone')}
                  </SelectItem>
                  {validParents.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {t('resources.site.navigation.itemDialog.parentChild', {
                        title: p.title,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. 所属分类分组 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                {t('resources.site.navigation.itemDialog.groupLabel')}
              </Label>
              {onOpenCreateGroup && (
                <button
                  type="button"
                  onClick={() => onOpenCreateGroup(location)}
                  className="text-primary flex items-center gap-0.5 text-xs hover:underline"
                >
                  <Plus className="size-3" />
                  {t('resources.site.navigation.actions.newGroup')}
                </button>
              )}
            </div>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue
                  placeholder={t(
                    'resources.site.navigation.itemDialog.groupPlaceholder',
                  )}
                />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {locationGroups.length === 0 ? (
                  <SelectItem value="none" disabled>
                    {t('resources.site.navigation.itemDialog.noGroups')}
                  </SelectItem>
                ) : (
                  locationGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} (
                      {g.location === 'header'
                        ? t('resources.site.navigation.locationHeader')
                        : t('resources.site.navigation.locationFooter')}
                      )
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 3. 菜单名称与描述 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="nav-title" className="text-xs">
                {t('resources.site.navigation.itemDialog.titleLabel')}
              </Label>
              <Input
                id="nav-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(
                  'resources.site.navigation.itemDialog.titlePlaceholder',
                )}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="nav-desc" className="text-xs">
                {t('resources.site.navigation.itemDialog.descriptionLabel')}
              </Label>
              <Input
                id="nav-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  'resources.site.navigation.itemDialog.descriptionPlaceholder',
                )}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <NameTranslationsInput
            value={translations}
            onChange={setTranslations}
          />

          {/* 4. 跳转 URL 与快捷填充 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="nav-url" className="text-xs">
                {t('resources.site.navigation.itemDialog.urlLabel')}
              </Label>
              <span className="text-muted-foreground text-xs">
                {t('resources.site.navigation.itemDialog.urlHint')}
              </span>
            </div>
            <Input
              id="nav-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t(
                'resources.site.navigation.itemDialog.urlPlaceholder',
              )}
              className="h-8 text-xs"
              required
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-muted-foreground text-xs">
                {t('resources.site.navigation.itemDialog.quickFillLabel')}
              </span>
              {QUICK_URLS.map((q) => (
                <button
                  key={q.url}
                  type="button"
                  onClick={() => {
                    setUrl(q.url)
                    if (!title) setTitle(q.label)
                  }}
                  className="bg-muted hover:bg-muted/80 text-foreground rounded px-1.5 py-0.5 text-xs transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. 打开方式与排序 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                {t('resources.site.navigation.itemDialog.targetLabel')}
              </Label>
              <Select
                value={target}
                onValueChange={(val) => setTarget(val as '_self' | '_blank')}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="_self">
                    {t('resources.site.navigation.itemDialog.targetSelf')}
                  </SelectItem>
                  <SelectItem value="_blank">
                    {t('resources.site.navigation.itemDialog.targetBlank')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="nav-sort" className="text-xs">
                {t('resources.site.navigation.sortLabel')}
              </Label>
              <Input
                id="nav-sort"
                type="number"
                value={sort}
                onChange={(e) => setSort(Number(e.target.value))}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          {/* 6. 启用开关 */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="nav-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="nav-enabled" className="cursor-pointer text-xs">
                {t('resources.site.navigation.itemDialog.enabledLabel')}
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs"
              disabled={submitting || !title.trim()}
            >
              {submitting
                ? t('common.actions.saving')
                : t('common.actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
