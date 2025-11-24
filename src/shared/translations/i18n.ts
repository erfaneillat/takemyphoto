import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import fa from './fa.json';

// Detect language based on domain and browser
function getInitialLanguage(): string {
  // 1. Check for Developer Override
  const debugOverride = localStorage.getItem('debug_region');
  if (debugOverride === 'IR') return 'fa';
  if (debugOverride === 'GLOBAL') return 'en';

  // 2. Check domain first
  const hostname = window.location.hostname;
  if (hostname.endsWith('.ir')) {
    return 'fa';
  }

  // Fallback to browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;

  // Check if browser language is Persian/Farsi
  if (browserLang.startsWith('fa') || browserLang.startsWith('per')) {
    return 'fa';
  }

  // Check if browser language is English
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  // Default to English for non-IR domains if browser is not Farsi
  return 'en';
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
    lng: getInitialLanguage(), // Initial language based on domain/browser
    fallbackLng: 'en',
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
