import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { Logo } from '@/shared/components';
import { useState } from 'react';

// Component to handle Google Login
const GoogleLoginButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { googleLogin, error, isLoading } = useAuthStore();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await response.json();
        
        // Login with our backend
        await googleLogin({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          profilePicture: userInfo.picture,
        });
        
        navigate('/');
      } catch (err) {
        console.error('Google login failed:', err);
        setLoginError('Failed to login with Google');
      }
    },
    onError: () => {
      console.error('Google login failed');
      setLoginError('Failed to login with Google');
    },
  });

  return (
    <>
      {/* Error Message */}
      {(error || loginError) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error || loginError}
          </p>
        </div>
      )}

      {/* Custom Google Login Button */}
      <button
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Google Icon */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          {isLoading ? t('auth.login.signingIn') : 'Sign in with Google'}
        </span>
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
        {t('auth.login.googleInfo')}
      </p>
    </>
  );
};

export const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
          <div className="w-full max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Logo size="lg" />
                  <div className="absolute inset-0 bg-gray-900/20 dark:bg-white/20 blur-2xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  {t('auth.login.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('auth.login.subtitle')}
                </p>
              </div>
            </div>

            {/* Auth Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                <GoogleLoginButton />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center px-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} {t('app.title')}. {t('app.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
