import {
  ArrowUpDown,
  CornerDownRight,
  Edit2,
  ExternalLink,
  Folder,
  FolderPlus,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notify } from '~/components/admin'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { siteService } from '../../service'
import type {
  NavLocation,
  SiteNavGroup,
  SiteNavGroupFormValues,
  SiteNavItem,
  SiteNavItemFormValues,
} from '../../types'
import { NavGroupDialog } from './nav-group-dialog'
import { NavItemDialog } from './nav-item-dialog'

export function NavigationEditor() {
  const { t } = useTranslation()
  const [items, setItems] = useState<SiteNavItem[]>([])
  const [groups, setGroups] = useState<SiteNavGroup[]>([])
  const [activeTab, setActiveTab] = useState<NavLocation>('header')

  // Item Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SiteNavItem | null>(null)
  const [itemLocationPreset, setItemLocationPreset] =
    useState<NavLocation>('header')
  const [parentPresetId, setParentPresetId] = useState<string | undefined>(
    undefined,
  )
  const [groupPresetId, setGroupPresetId] = useState<string | undefined>(
    undefined,
  )

  // Group Dialog states
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<SiteNavGroup | null>(null)
  const [groupLocationPreset, setGroupLocationPreset] =
    useState<NavLocation>('footer')

  const loadData = async () => {
    try {
      const [allNavs, allGroups] = await Promise.all([
        siteService.getAllNavItems(),
        siteService.getNavGroups(),
      ])
      setItems(allNavs)
      setGroups(allGroups)
    } catch (e: unknown) {
      const err = e as Error
      notify.error(
        err?.message || t('resources.site.navigation.toasts.loadFailed'),
      )
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial load
  useEffect(() => {
    loadData()
  }, [])

  // Header & Footer items separation
  const headerItems = items.filter((i) => i.location === 'header')
  const footerItems = items.filter((i) => i.location === 'footer')

  // Top level header items
  const headerTopLevel = headerItems
    .filter((i) => !i.parentId)
    .sort((a, b) => a.sort - b.sort)

  // Header groups & Footer groups
  const headerGroups = groups
    .filter((g) => g.location === 'header')
    .sort((a, b) => a.sort - b.sort)

  const footerGroups = groups
    .filter((g) => g.location === 'footer')
    .sort((a, b) => a.sort - b.sort)

  // --- Group Actions ---
  const handleOpenCreateGroup = (loc: NavLocation) => {
    setEditingGroup(null)
    setGroupLocationPreset(loc)
    setGroupDialogOpen(true)
  }

  const handleEditGroup = (g: SiteNavGroup) => {
    setEditingGroup(g)
    setGroupLocationPreset(g.location)
    setGroupDialogOpen(true)
  }

  const handleSaveGroup = async (
    values: SiteNavGroupFormValues & { id?: string },
  ) => {
    try {
      await siteService.saveNavGroup(values)
      notify.success(
        values.id
          ? t('resources.site.navigation.toasts.groupUpdated')
          : t('resources.site.navigation.toasts.groupCreated'),
      )
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(
        err?.message || t('resources.site.navigation.toasts.groupSaveFailed'),
      )
    }
  }

  const handleDeleteGroup = async (group: SiteNavGroup) => {
    if (
      !confirm(
        t('resources.site.navigation.toasts.deleteGroupConfirm', {
          name: group.name,
        }),
      )
    ) {
      return
    }
    try {
      await siteService.deleteNavGroup(group.id)
      notify.success(
        t('resources.site.navigation.toasts.groupDeleted', {
          name: group.name,
        }),
      )
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(
        err?.message || t('resources.site.navigation.toasts.groupDeleteFailed'),
      )
    }
  }

  // --- Item Actions ---
  const handleOpenCreateItem = (
    loc: NavLocation,
    parentId?: string,
    groupId?: string,
  ) => {
    setEditingItem(null)
    setItemLocationPreset(loc)
    setParentPresetId(parentId)
    setGroupPresetId(groupId)
    setItemDialogOpen(true)
  }

  const handleEditItem = (item: SiteNavItem) => {
    setEditingItem(item)
    setParentPresetId(undefined)
    setGroupPresetId(undefined)
    setItemDialogOpen(true)
  }

  const handleSaveItem = async (
    values: SiteNavItemFormValues & { id?: string },
  ) => {
    try {
      await siteService.saveNavItem(values)
      notify.success(
        values.parentId
          ? t('resources.site.navigation.toasts.childSaved')
          : t('resources.site.navigation.toasts.itemSaved'),
      )
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.shared.saveFailed'))
    }
  }

  const handleDeleteItem = async (item: SiteNavItem) => {
    const hasChildren = items.some((i) => i.parentId === item.id)
    const promptMsg = hasChildren
      ? t('resources.site.navigation.toasts.deleteItemWithChildren', {
          name: item.title,
        })
      : t('resources.site.navigation.toasts.deleteItemConfirm', {
          name: item.title,
        })

    if (!confirm(promptMsg)) return

    try {
      await siteService.deleteNavItem(item.id)
      notify.success(t('resources.site.navigation.toasts.itemDeleted'))
      loadData()
    } catch (e: unknown) {
      const err = e as Error
      notify.error(err?.message || t('resources.site.shared.deleteFailed'))
    }
  }

  const handleToggleItem = async (item: SiteNavItem, enabled: boolean) => {
    try {
      await siteService.saveNavItem({ ...item, enabled })
      setItems(items.map((i) => (i.id === item.id ? { ...i, enabled } : i)))
      notify.success(
        enabled
          ? t('resources.site.navigation.toasts.itemEnabled', {
              name: item.title,
            })
          : t('resources.site.navigation.toasts.itemDisabled', {
              name: item.title,
            }),
      )
    } catch {
      notify.error(t('resources.site.shared.statusUpdateFailed'))
    }
  }

  const handleToggleGroup = async (group: SiteNavGroup, enabled: boolean) => {
    try {
      await siteService.saveNavGroup({ ...group, enabled })
      setGroups(groups.map((g) => (g.id === group.id ? { ...g, enabled } : g)))
      notify.success(
        enabled
          ? t('resources.site.navigation.toasts.groupEnabled', {
              name: group.name,
            })
          : t('resources.site.navigation.toasts.groupDisabled', {
              name: group.name,
            }),
      )
    } catch {
      notify.error(t('resources.site.shared.statusUpdateFailed'))
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶部总控栏 */}
      <div className="bg-muted/40 flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Layers className="text-primary size-4" />
            {t('resources.site.navigation.title')}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t('resources.site.navigation.description')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenCreateGroup(activeTab)}
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <FolderPlus className="size-3.5" />
            {t('resources.site.navigation.actions.newGroup')}
          </Button>

          <Button
            onClick={() => handleOpenCreateItem(activeTab)}
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            {t('resources.site.navigation.actions.newItem')}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as NavLocation)}
        className="space-y-4"
      >
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="header" className="text-xs">
            {t('resources.site.navigation.tabs.header', {
              topLevel: headerTopLevel.length,
              total: headerItems.length,
            })}
          </TabsTrigger>
          <TabsTrigger value="footer" className="text-xs">
            {t('resources.site.navigation.tabs.footer', {
              groups: footerGroups.length,
              items: footerItems.length,
            })}
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* 1. 页眉导航 TAB (Header：树形顶级 + 子菜单下拉结构) */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="header" className="space-y-4">
          <div className="bg-card flex items-center justify-between rounded-lg border p-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-foreground font-medium">
                {t('resources.site.navigation.headerGroupsLabel')}
              </span>
              <span className="text-muted-foreground ml-1">
                {headerGroups.length === 0
                  ? t('resources.site.navigation.noHeaderGroups')
                  : headerGroups.map((g) => g.name).join('、')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenCreateGroup('header')}
              className="text-primary h-7 gap-1 text-xs"
            >
              <FolderPlus className="size-3" />
              {t('resources.site.navigation.actions.manageHeaderGroups')}
            </Button>
          </div>

          <Card>
            <CardHeader className="border-b p-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {t('resources.site.navigation.headerTreeTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('resources.site.navigation.headerTreeDescription')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => handleOpenCreateItem('header')}
                >
                  <Plus className="size-3" />
                  {t('resources.site.navigation.actions.addTopItem')}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              {headerTopLevel.length === 0 ? (
                <div className="text-muted-foreground space-y-2 py-10 text-center text-xs">
                  <p>{t('resources.site.navigation.noHeaderItems')}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCreateItem('header')}
                  >
                    {t('resources.site.navigation.actions.addFirstItem')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {headerTopLevel.map((parent) => {
                    const childItems = headerItems
                      .filter((c) => c.parentId === parent.id)
                      .sort((a, b) => a.sort - b.sort)

                    return (
                      <div
                        key={parent.id}
                        className="bg-card/80 hover:border-primary/40 overflow-hidden rounded-lg border shadow-2xs transition-all"
                      >
                        {/* 顶级菜单行 */}
                        <div className="bg-muted/20 flex flex-col justify-between gap-2 p-3 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground bg-background flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-xs">
                              <ArrowUpDown className="size-3" />
                              {parent.sort}
                            </span>
                            <div>
                              <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                                <span>{parent.title}</span>
                                {childItems.length > 0 ? (
                                  <Badge
                                    variant="default"
                                    className="h-4 px-1.5 py-0 text-xs font-normal"
                                  >
                                    {t(
                                      'resources.site.navigation.badges.withChildren',
                                      { total: childItems.length },
                                    )}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-muted-foreground h-4 px-1 py-0 text-xs font-normal"
                                  >
                                    {t(
                                      'resources.site.navigation.badges.directLink',
                                    )}
                                  </Badge>
                                )}
                                {parent.group && (
                                  <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
                                    {t(
                                      'resources.site.navigation.badges.group',
                                      {
                                        name: parent.group,
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="text-muted-foreground mt-0.5 flex items-center gap-2 font-mono text-xs">
                                <span>{parent.url}</span>
                                {parent.description && (
                                  <span className="text-muted-foreground/80 text-xs italic">
                                    · {parent.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* 快捷为该项添加子菜单 */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/30 text-primary hover:bg-primary/5 h-7 gap-1 text-xs"
                              onClick={() =>
                                handleOpenCreateItem(
                                  'header',
                                  parent.id,
                                  parent.groupId,
                                )
                              }
                            >
                              <Plus className="size-3" />
                              {t('resources.site.navigation.actions.addChild')}
                            </Button>

                            <div className="ml-2 flex items-center gap-1.5">
                              <Switch
                                checked={parent.enabled}
                                onCheckedChange={(checked) =>
                                  handleToggleItem(parent, checked)
                                }
                              />
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(parent)}
                              className="text-muted-foreground hover:text-foreground size-7"
                              title={t(
                                'resources.site.navigation.tooltips.editItem',
                              )}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(parent)}
                              className="text-muted-foreground hover:text-destructive size-7"
                              title={t(
                                'resources.site.navigation.tooltips.deleteItem',
                              )}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* 展开呈现的子菜单列表 */}
                        {childItems.length > 0 && (
                          <div className="bg-background/50 divide-y border-t py-1 pr-3 pl-6 sm:pl-8">
                            {childItems.map((child) => (
                              <div
                                key={child.id}
                                className="hover:bg-muted/20 flex items-center justify-between py-2 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <CornerDownRight className="text-muted-foreground/60 size-3.5 shrink-0" />
                                  <span className="text-muted-foreground bg-muted py-0.2 rounded px-1 font-mono text-xs">
                                    {child.sort}
                                  </span>
                                  <div>
                                    <div className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                                      {child.title}
                                      {child.target === '_blank' && (
                                        <Badge
                                          variant="outline"
                                          className="h-3.5 px-1 py-0 text-[9px] font-normal"
                                        >
                                          <ExternalLink className="mr-0.5 size-2.5" />
                                          {t(
                                            'resources.site.navigation.badges.newWindow',
                                          )}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
                                      <span>{child.url}</span>
                                      {child.description && (
                                        <span className="text-muted-foreground/70">
                                          ({child.description})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Switch
                                    checked={child.enabled}
                                    onCheckedChange={(checked) =>
                                      handleToggleItem(child, checked)
                                    }
                                    className="scale-90"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditItem(child)}
                                    className="text-muted-foreground hover:text-foreground size-7"
                                  >
                                    <Edit2 className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteItem(child)}
                                    className="text-muted-foreground hover:text-destructive size-7"
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* 2. 页脚导航 TAB (Footer：按分类名分列渲染与管理) */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="footer" className="space-y-4">
          <div className="bg-card flex items-center justify-between rounded-lg border p-3 text-xs">
            <div>
              <span className="text-foreground font-semibold">
                {t('resources.site.navigation.footerTitle')}
              </span>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t('resources.site.navigation.footerDescription')}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenCreateGroup('footer')}
              className="h-7 gap-1 text-xs"
            >
              <FolderPlus className="size-3" />
              {t('resources.site.navigation.actions.addFooterGroup')}
            </Button>
          </div>

          {/* 渲染各分类卡片 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {footerGroups.map((group) => {
              const groupItems = footerItems
                .filter((i) => i.groupId === group.id || i.group === group.name)
                .sort((a, b) => a.sort - b.sort)

              return (
                <Card
                  key={group.id}
                  className="hover:border-primary/40 flex flex-col border shadow-xs transition-all"
                >
                  <CardHeader className="bg-muted/20 border-b p-3.5 pb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Folder className="text-primary size-4" />
                        <CardTitle className="text-sm font-semibold">
                          {group.name}
                        </CardTitle>
                        <span className="text-muted-foreground bg-background rounded border px-1 font-mono text-xs">
                          {t('resources.site.navigation.badges.sort', {
                            sort: group.sort,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Switch
                          checked={group.enabled}
                          onCheckedChange={(checked) =>
                            handleToggleGroup(group, checked)
                          }
                          title={t(
                            'resources.site.navigation.tooltips.toggleGroup',
                          )}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGroup(group)}
                          className="text-muted-foreground hover:text-foreground size-7"
                          title={t(
                            'resources.site.navigation.tooltips.editGroup',
                          )}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGroup(group)}
                          className="text-muted-foreground hover:text-destructive size-7"
                          title={t(
                            'resources.site.navigation.tooltips.deleteGroup',
                          )}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    {group.description && (
                      <CardDescription className="line-clamp-1 pt-0.5 text-xs">
                        {group.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-3">
                    <div className="divide-border/60 space-y-1.5 divide-y">
                      {groupItems.length === 0 ? (
                        <div className="text-muted-foreground py-6 text-center text-xs">
                          {t('resources.site.navigation.noGroupLinks')}
                        </div>
                      ) : (
                        groupItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between pt-1.5 first:pt-0"
                          >
                            <div className="max-w-[200px] space-y-0.5">
                              <div className="text-foreground flex items-center gap-1 truncate text-xs font-medium">
                                <span>{item.title}</span>
                                {item.target === '_blank' && (
                                  <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                                )}
                              </div>
                              <div className="text-muted-foreground truncate font-mono text-xs">
                                {item.url}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Switch
                                checked={item.enabled}
                                onCheckedChange={(checked) =>
                                  handleToggleItem(item, checked)
                                }
                                className="scale-75"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditItem(item)}
                                className="text-muted-foreground hover:text-foreground size-6"
                              >
                                <Edit2 className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteItem(item)}
                                className="text-muted-foreground hover:text-destructive size-6"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleOpenCreateItem('footer', undefined, group.id)
                      }
                      className="text-primary hover:bg-primary/5 mt-2 h-7 w-full gap-1 border-dashed text-xs"
                    >
                      <Plus className="size-3" />
                      {t('resources.site.navigation.actions.addLinkToGroup', {
                        name: group.name,
                      })}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 检查是否有未分组的页脚链接 */}
          {footerItems.filter(
            (i) => !i.groupId && !footerGroups.some((g) => g.name === i.group),
          ).length > 0 && (
            <Card className="bg-muted/20 border-dashed">
              <CardHeader className="p-3">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  {t('resources.site.navigation.ungroupedTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="divide-y text-xs">
                  {footerItems
                    .filter(
                      (i) =>
                        !i.groupId &&
                        !footerGroups.some((g) => g.name === i.group),
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <div className="text-foreground font-medium">
                            {item.title}
                          </div>
                          <div className="text-muted-foreground font-mono text-xs">
                            {item.url}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleEditItem(item)}
                        >
                          {t('resources.site.navigation.actions.assignGroup')}
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 菜单项编辑与子菜单创建弹窗 */}
      <NavItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        initialData={editingItem}
        defaultLocation={
          editingItem ? editingItem.location : itemLocationPreset
        }
        defaultParentId={parentPresetId}
        defaultGroupId={groupPresetId}
        groups={groups}
        parentCandidates={items}
        onSave={handleSaveItem}
        onOpenCreateGroup={handleOpenCreateGroup}
      />

      {/* 分类名字管理与新增弹窗 */}
      <NavGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        group={editingGroup}
        defaultLocation={groupLocationPreset}
        onSave={handleSaveGroup}
      />
    </div>
  )
}
