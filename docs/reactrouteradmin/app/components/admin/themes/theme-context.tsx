import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { type ThemePreset, themePresets } from './presets'

interface ThemePresetContextValue {
  preset: ThemePreset
  setPreset: (preset: ThemePreset) => void
}

const ThemePresetContext = createContext<ThemePresetContextValue | null>(null)

export function ThemePresetProvider({
  defaultPreset = 'shadcn',
  children,
}: {
  defaultPreset?: ThemePreset
  children: React.ReactNode
}) {
  const [preset, setPresetState] = useState<ThemePreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_theme_preset') as ThemePreset
      if (saved && themePresets[saved]) return saved
    }
    return defaultPreset
  })

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_theme_preset', newPreset)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const config = themePresets[preset]
    if (config) {
      for (const [key, value] of Object.entries(config.cssVars)) {
        root.style.setProperty(key, value)
      }
      root.dataset.preset = preset
    }
  }, [preset])

  return (
    <ThemePresetContext.Provider value={{ preset, setPreset }}>
      {children}
    </ThemePresetContext.Provider>
  )
}

export function useThemePreset(): ThemePresetContextValue {
  const context = useContext(ThemePresetContext)
  if (!context) {
    throw new Error('useThemePreset must be used within ThemePresetProvider')
  }
  return context
}
