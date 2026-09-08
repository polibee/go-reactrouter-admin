import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '~/locales/en'

export const i18n = createInstance()

void i18n.use(initReactI18next).init({
  resources: { en },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: ['translation'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  returnNull: false,
})
