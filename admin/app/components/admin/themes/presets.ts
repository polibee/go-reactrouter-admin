export type ThemePreset = 'shadcn' | 'semi' | 'filament' | 'compact'

export type ThemePresetNameKey =
  | 'common.presets.shadcn.name'
  | 'common.presets.semi.name'
  | 'common.presets.filament.name'
  | 'common.presets.compact.name'

export type ThemePresetDescriptionKey =
  | 'common.presets.shadcn.description'
  | 'common.presets.semi.description'
  | 'common.presets.filament.description'
  | 'common.presets.compact.description'

export interface PresetConfig {
  id: ThemePreset
  name: ThemePresetNameKey
  description: ThemePresetDescriptionKey
  radius: string // e.g. '0.5rem', '0.75rem', '0.25rem'
  density: 'comfortable' | 'compact' | 'spacious'
  cssVars: Record<string, string>
}

export const themePresets: Record<ThemePreset, PresetConfig> = {
  shadcn: {
    id: 'shadcn',
    name: 'common.presets.shadcn.name',
    description: 'common.presets.shadcn.description',
    radius: '0.625rem',
    density: 'comfortable',
    cssVars: {
      '--radius': '0.625rem',
    },
  },
  semi: {
    id: 'semi',
    name: 'common.presets.semi.name',
    description: 'common.presets.semi.description',
    radius: '0.875rem',
    density: 'comfortable',
    cssVars: {
      '--radius': '0.875rem',
    },
  },
  filament: {
    id: 'filament',
    name: 'common.presets.filament.name',
    description: 'common.presets.filament.description',
    radius: '0.5rem',
    density: 'compact',
    cssVars: {
      '--radius': '0.5rem',
    },
  },
  compact: {
    id: 'compact',
    name: 'common.presets.compact.name',
    description: 'common.presets.compact.description',
    radius: '0.25rem',
    density: 'compact',
    cssVars: {
      '--radius': '0.25rem',
    },
  },
}
