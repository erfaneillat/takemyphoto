import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useTranslation } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';

// Decode JWT token to get user info
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { googleLogin, error, isLoading } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google');
      return;
    }

    // Decode the JWT to get user info
    const userInfo = decodeJWT(credentialResponse.credential);
    if (!userInfo) {
      console.error('Failed to decode user info');
      return;
    }

    try {
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
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
          <div className="w-full max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles 
                    className="text-gray-900 dark:text-white" 
                    size={40} 
                  />
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
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}

                {/* Google Login Button */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t('auth.login.signingIn')}
                    </p>
                  </div>
                )}

                {/* Info Text */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                  {t('auth.login.googleInfo')}
                </p>
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
