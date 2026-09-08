import { Check, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { themePresets, type ThemePreset } from './presets'
import { useThemePreset } from './theme-context'

export function PresetSelector() {
  const { t } = useTranslation()
  const { preset, setPreset } = useThemePreset()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="scale-95 rounded-full"
          title={t('common.presets.title')}
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">{t('common.presets.switchToPreset')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('common.presets.menuLabel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(themePresets) as ThemePreset[]).map((key) => {
          const item = themePresets[key]
          const isSelected = preset === key
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => setPreset(key)}
              className="flex cursor-pointer items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium">{t(item.name)}</div>
                <div className="text-muted-foreground text-xs">
                  {item.density === 'compact'
                    ? t('common.presets.densityCompact')
                    : t('common.presets.densityComfortable')}
                </div>
              </div>
              {isSelected && <Check className="text-primary h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
