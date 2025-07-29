// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from '../locales/ar'; // adjust the path if needed

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'ar',
    fallbackLng: 'ar',
    resources: {
      ar: {
        translation: ar
      }
    },
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
