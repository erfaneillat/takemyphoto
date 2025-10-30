import { useEffect } from 'react';
import { useCharacterStore } from '@/shared/stores';
import { useAuthStore } from '@/shared/stores';

/**
 * Hook to initialize characters on app load
 * Fetches user's characters from server when authenticated
 */
export const useCharacterInit = () => {
  const { fetchCharacters } = useCharacterStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCharacters().catch((error) => {
        console.error('Failed to fetch characters on init:', error);
      });
    }
    // Only run once on mount and when authentication status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
};
