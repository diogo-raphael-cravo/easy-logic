import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import ptBRTranslation from './locales/pt-BR.json'

// Detect browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  // If browser language starts with 'pt', use pt-BR
  if (browserLang.startsWith('pt')) {
    return 'pt-BR'
  }
  return 'en'
}

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      'pt-BR': { translation: ptBRTranslation },
    },
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18next
