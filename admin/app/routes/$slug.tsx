import { useParams } from 'react-router'
import { SinglePageView } from '~/components/site/single-page-content'

const RESERVED_SLUGS = new Set([
  'portal',
  'links',
  'admin',
  'login',
  'register',
  'forgot-password',
  '500',
  '404',
  'api',
  'favicon.ico',
])

export default function RootSlugRoute() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug || RESERVED_SLUGS.has(slug)) {
    return null
  }

  return <SinglePageView slug={slug} />
}
