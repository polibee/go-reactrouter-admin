import type React from 'react'
import { ThemeProvider } from '~/components/theme-provider'
import { AdminProvider } from '~/core/admin'
import { AuthProvider } from '~/core/auth'
import { I18nProvider } from '~/core/i18n'
import { PermissionProvider } from '~/core/permissions'
import { QueryProvider } from './query-provider'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <I18nProvider>
        <ThemeProvider attribute="class">
          <AuthProvider>
            <PermissionProvider>
              <AdminProvider>{children}</AdminProvider>
            </PermissionProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryProvider>
  )
}
