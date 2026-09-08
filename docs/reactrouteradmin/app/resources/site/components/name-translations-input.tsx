import { useTranslation } from 'react-i18next'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { getTranslationLocales } from '../localize'

export interface NameTranslationsInputProps {
  value?: Record<string, string>
  onChange: (next: Record<string, string>) => void
}

// Renders one name input per configured non-default locale. Hidden entirely
// while only the fallback locale exists, so editors are unchanged today.
export function NameTranslationsInput({
  value,
  onChange,
}: NameTranslationsInputProps) {
  const { t } = useTranslation()
  const locales = getTranslationLocales()
  if (locales.length === 0) return null

  return (
    <div className="bg-muted/30 space-y-2.5 rounded-lg border p-3">
      <div className="text-muted-foreground text-xs font-medium">
        {t('resources.site.nameTranslations.title')}
      </div>
      {locales.map((locale) => (
        <div key={locale} className="space-y-1">
          <Label htmlFor={`name-translation-${locale}`} className="text-xs">
            {t('resources.site.nameTranslations.inputLabel', { locale })}
          </Label>
          <Input
            id={`name-translation-${locale}`}
            value={value?.[locale] ?? ''}
            onChange={(e) => {
              const next = { ...value }
              const text = e.target.value
              if (text) next[locale] = text
              else delete next[locale]
              onChange(next)
            }}
            className="h-8 text-xs"
          />
        </div>
      ))}
    </div>
  )
}
