export interface AdminThemeConfig {
  defaultMode: 'light' | 'dark' | 'system'
}

export interface AdminBranding {
  title: string
  logoUrl?: string
  homeUrl?: string
}

export interface AdminFeatures {
  table?: boolean
  forms?: boolean
  upload?: boolean
  charts?: boolean
  commandPalette?: boolean
  datePicker?: boolean
  notifications?: boolean
  darkTheme?: boolean
}

export interface AdminConfig {
  name: string
  locale: string
  path: string
  theme: AdminThemeConfig
  branding: AdminBranding
  features: AdminFeatures
}

export const adminConfig: AdminConfig = {
  name: 'ReactRouterAdmin',
  locale: 'en',
  path: '/admin',
  theme: {
    defaultMode: 'system',
  },
  branding: {
    title: 'React Admin',
    homeUrl: '/',
  },
  features: {
    table: true,
    forms: true,
    upload: false,
    charts: true,
    commandPalette: true,
    datePicker: true,
    notifications: true,
    darkTheme: true,
  },
}
