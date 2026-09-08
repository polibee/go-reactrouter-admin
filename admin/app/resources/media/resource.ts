import { Image as ImageIcon } from 'lucide-react'
import { i18n } from '~/core/i18n'
import { defineResource } from '~/resource-engine/resource'
import type { MediaItem } from './types'

export const MediaResource = defineResource<MediaItem>({
  name: 'media',
  label: i18n.t('resources.media.resource.label'),
  pluralLabel: i18n.t('resources.media.resource.pluralLabel'),
  icon: ImageIcon,
  navigation: {
    group: i18n.t('resources.site.group'),
    sort: 40,
  },
  permissions: {
    view: 'media.view',
    create: 'media.upload',
    delete: 'media.delete',
  },
  routes: {
    path: '/admin/media',
    listPath: '/admin/media',
  },
})
