import { useEffect } from 'react';
import { useAuthStore } from '@/shared/stores';
import { userService } from '@/shared/services';

/**
 * Hook to initialize authentication state on app load
 * Validates stored tokens and fetches current user
 */
export const useAuthInit = () => {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      const token = localStorage.getItem('accessToken');

      // No token: ensure any persisted auth state is cleared
      if (!token) {
        logout();
        setLoading(false);
        return;
      }

      // Always fetch fresh user data from server to ensure stars and other fields are up-to-date
      try {
        const me = await userService.getMe();
        setUser(me);
      } catch (error) {
        // Token invalid/expired; clear state
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
