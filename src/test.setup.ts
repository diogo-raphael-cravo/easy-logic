import '@testing-library/jest-dom'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './i18n/locales/en.json'

// Initialize i18n for tests
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: enTranslation },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    })
}
