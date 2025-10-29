import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import fa from './fa.json';

// Detect browser language
function getBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check if browser language is Persian/Farsi
  if (browserLang.startsWith('fa') || browserLang.startsWith('per')) {
    return 'fa';
  }
  
  // Check if browser language is English
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  
  // Default to Persian for other languages
  return 'fa';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      fa: {
        translation: fa,
      },
    },
    lng: getBrowserLanguage(), // Auto-detect browser language
    fallbackLng: 'fa',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Set initial direction
document.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';

export default i18n;
