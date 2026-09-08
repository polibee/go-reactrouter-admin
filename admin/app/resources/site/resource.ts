import { Compass, FileText, LayoutGrid, Link2, Megaphone } from 'lucide-react'
import { i18n } from '~/core/i18n'
import { defineResource } from '~/resource-engine/resource'
import type {
  FriendLink,
  SiteAnnouncement,
  SiteNavItem,
  SitePage,
  SiteWidgetConfig,
} from './types'

export const SitePagesResource = defineResource<SitePage>({
  name: 'site-pages',
  label: i18n.t('resources.site.pages.label'),
  pluralLabel: i18n.t('resources.site.pages.pluralLabel'),
  icon: FileText,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 10,
  },
  permissions: {
    view: 'site.view',
    create: 'site.pages',
    update: 'site.pages',
    delete: 'site.pages',
  },
  routes: {
    path: '/admin/pages',
    listPath: '/admin/pages',
    createPath: '/admin/pages/create',
    editPath: '/admin/pages/:id/edit',
  },
})

export const SiteNavResource = defineResource<SiteNavItem>({
  name: 'site-navigation',
  label: i18n.t('resources.site.navigation.label'),
  pluralLabel: i18n.t('resources.site.navigation.pluralLabel'),
  icon: Compass,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 20,
  },
  permissions: {
    view: 'site.view',
    update: 'site.navigation',
  },
  routes: {
    path: '/admin/navigation',
    listPath: '/admin/navigation',
  },
})

export const SiteWidgetsResource = defineResource<SiteWidgetConfig>({
  name: 'site-widgets',
  label: i18n.t('resources.site.widgets.label'),
  pluralLabel: i18n.t('resources.site.widgets.pluralLabel'),
  icon: LayoutGrid,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 30,
  },
  permissions: {
    view: 'site.view',
    update: 'site.widgets',
  },
  routes: {
    path: '/admin/widgets',
    listPath: '/admin/widgets',
  },
})

export const SiteOperationsResource = defineResource<SiteAnnouncement>({
  name: 'site-operations',
  label: i18n.t('resources.site.operations.label'),
  pluralLabel: i18n.t('resources.site.operations.pluralLabel'),
  icon: Megaphone,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 40,
  },
  permissions: {
    view: 'site.view',
    update: 'site.operations',
  },
  routes: {
    path: '/admin/operations',
    listPath: '/admin/operations',
  },
})

export const SiteLinksResource = defineResource<FriendLink>({
  name: 'site-links',
  label: i18n.t('resources.site.links.label'),
  pluralLabel: i18n.t('resources.site.links.pluralLabel'),
  icon: Link2,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 50,
  },
  permissions: {
    view: 'site.view',
    create: 'site.links',
    update: 'site.links',
    delete: 'site.links',
  },
  routes: {
    path: '/admin/links',
    listPath: '/admin/links',
  },
})
