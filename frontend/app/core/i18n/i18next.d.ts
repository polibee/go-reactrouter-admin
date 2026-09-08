import type en from '~/locales/en'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: typeof en
    strictKeyChecks: true
  }
}
