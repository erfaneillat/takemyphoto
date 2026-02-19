import { useEffect } from 'react';
import { useThemeStore } from '@/shared/stores';
import { useTranslation } from './useTranslation';
import { useRegion } from './useRegion';

/**
 * Hook to initialize app settings (theme and language) on first visit
 * - Detects system theme preference (light/dark)
 * - Detects browser language preference
 * - In Iran mode, defaults language to Farsi
 * - Persists user preferences in localStorage for subsequent visits
 */
export const useAppInit = () => {
  const { theme } = useThemeStore();
  const { language, changeLanguage, t } = useTranslation();
  const { isIran, isLoading: regionLoading } = useRegion();

  // Auto-set language to Farsi in Iran mode
  useEffect(() => {
    if (regionLoading) return;
    if (isIran && language !== 'fa') {
      changeLanguage('fa');
    }
  }, [isIran, regionLoading]);

  useEffect(() => {
    // Update document title based on translation
    document.title = `${t('app.title')} - ${t('app.description')}`;
  }, [language, t]);

  useEffect(() => {
    // Ensure theme is applied on mount
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Ensure text direction is set based on language
    document.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);
};

