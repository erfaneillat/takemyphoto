import { useEffect } from 'react';
import { useThemeStore } from '@/shared/stores';
import { useTranslation } from './useTranslation';

/**
 * Hook to initialize app settings (theme and language) on first visit
 * - Detects system theme preference (light/dark)
 * - Detects browser language preference
 * - Persists user preferences in localStorage for subsequent visits
 */
export const useAppInit = () => {
  const { theme } = useThemeStore();
  const { language } = useTranslation();

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
