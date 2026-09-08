import { i18n } from '~/core/i18n'

export interface LocalizedNameEntity {
  name?: string
  title?: string
  nameTranslations?: Record<string, string>
}

// Resolves the display name for the active language, falling back to the
// base field when no override exists for that locale.
export function localizedName(
  entity: LocalizedNameEntity,
  language: string,
): string {
  return (
    entity.nameTranslations?.[language] || entity.name || entity.title || ''
  )
}

// Locales (beyond the fallback language) that editors should offer
// translation inputs for; empty while only the default locale is configured.
export function getTranslationLocales(): string[] {
  const resources = i18n.options.resources as
    | Record<string, unknown>
    | undefined
  const locales = resources ? Object.keys(resources) : []
  const fallback = i18n.options.fallbackLng
  const fallbackLng =
    typeof fallback === 'string'
      ? fallback
      : Array.isArray(fallback)
        ? (fallback[0] ?? 'en')
        : 'en'
  return locales.filter((lng) => lng !== fallbackLng)
}
