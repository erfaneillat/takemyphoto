import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/core/domain/entities/User';
import { authService, type GoogleUserData } from '@/shared/services/authService';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (phoneNumber: string) => Promise<void>;
  verifyCode: (phoneNumber: string, code: string) => Promise<void>;
  googleLogin: (googleUserData: GoogleUserData) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      clearError: () => set({ error: null }),

      login: async (phoneNumber) => {
        set({ error: null });
        try {
          await authService.sendVerificationCode(phoneNumber);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Failed to send verification code';
          set({
            error: errorMessage,
          });
          throw error;
        }
      },

      verifyCode: async (phoneNumber, code) => {
        set({ error: null });
        try {
          const response = await authService.verifyCode(phoneNumber, code);
          const user = response.data.user;
          
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Verification failed';
          set({
            error: errorMessage,
          });
          throw error;
        }
      },

      googleLogin: async (googleUserData) => {
        set({ error: null, isLoading: true });
        try {
          const response = await authService.googleLogin(googleUserData);
          const user = response.data.user;
          
          set({
            user,
            isAuthenticated: true,
            error: null,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Google login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const response = await authService.getCurrentUser();
          const user = response.data.user;
          
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          // If refresh fails (e.g., token expired), logout
          console.error('Failed to refresh user:', error);
          if (error.response?.status === 401) {
            authService.logout();
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          }
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: 'nero-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
