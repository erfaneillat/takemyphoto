import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useTranslation, useRegion } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { Logo } from '@/shared/components';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, CheckCircle2, RefreshCw, Mail } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Error Message */}
      {(error || loginError) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <div className="shrink-0 text-red-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || loginError}
          </p>
        </div>
      )}

      {/* Custom Google Login Button */}
      <button
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        className="w-full group relative flex items-center justify-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
        {isLoading && (
          <div className="absolute right-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
        {t('auth.login.googleInfo')}
      </p>
    </motion.div>
  );
};

const PhoneLoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, verifyCode, error, isLoading, clearError } = useAuthStore();

  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    try {
      await login(phoneNumber);
      setStep('CODE');
      setCountdown(60); // 60 seconds cooldown
      clearError();
    } catch (err) {
      console.error('Failed to send code:', err);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    try {
      await verifyCode(phoneNumber, code);
      navigate('/');
    } catch (err) {
      console.error('Failed to verify code:', err);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    try {
      await login(phoneNumber);
      setCountdown(60);
      clearError();
    } catch (err) {
      console.error('Failed to resend code:', err);
    }
  };

  const handleChangeNumber = () => {
    setStep('PHONE');
    setCode('');
    clearError();
  };

  // OTP Input Rendering
  const renderOtpInput = () => {
    return (
      <div className="relative w-full" dir="ltr">
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(val);
            if (val.length === 6) {
              verifyCode(phoneNumber, val).then(() => navigate('/')).catch(console.error);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        <div className="flex gap-2 sm:gap-3 justify-center w-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center rounded-xl border-2 text-xl sm:text-2xl font-bold transition-all duration-200 ${code[i]
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : i === code.length
                  ? 'border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-800 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/30 scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400'
                }`}
            >
              {code[i] || ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <div className="shrink-0 text-red-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'PHONE' ? (
          <motion.form
            key="phone-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSendCode}
            className="space-y-4"
          >
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.login.phoneLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('auth.login.phonePlaceholder')}
                  className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                  dir="ltr"
                  autoComplete="tel"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('auth.login.continueButton')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="code-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerifyCode}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.verification.subtitle')}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="font-semibold text-gray-900 dark:text-white text-lg" dir="ltr">
                  {phoneNumber}
                </p>
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title={t('auth.verification.changeNumber')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>

            {renderOtpInput()}

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('auth.verification.verifyButton')
              )}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('auth.verification.resendIn')} <span className="font-mono font-medium">{countdown}</span> {t('auth.verification.seconds')}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('auth.verification.resendCode')}
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const { isIran, isLoading: isRegionLoading } = useRegion();
  const [loginMethod, setLoginMethod] = useState<'PHONE' | 'GOOGLE'>('PHONE');

  // Set default login method based on region when loading finishes
  useEffect(() => {
    if (!isRegionLoading) {
      setLoginMethod(isIran ? 'PHONE' : 'GOOGLE');
    }
  }, [isRegionLoading, isIran]);

  if (isRegionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Logo and Header */}
            <div className="text-center mb-6 sm:mb-8 space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <Logo size="lg" />
                  <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-3xl rounded-full" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  {t('auth.login.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('auth.login.subtitle')}
                </p>
              </div>
            </div>

            {/* Auth Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 p-6 sm:p-8 border border-white/20 dark:border-gray-800 ring-1 ring-black/5">
              {isIran && (
                <div className="flex p-1.5 mb-8 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl relative">
                  <button
                    onClick={() => setLoginMethod('PHONE')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors relative z-10 flex items-center justify-center gap-2 ${loginMethod === 'PHONE'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {loginMethod === 'PHONE' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('auth.login.phoneLabel')}
                    </span>
                  </button>
                  <button
                    onClick={() => setLoginMethod('GOOGLE')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors relative z-10 flex items-center justify-center gap-2 ${loginMethod === 'GOOGLE'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {loginMethod === 'GOOGLE' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Google
                    </span>
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {loginMethod === 'PHONE' ? (
                  <motion.div
                    key="phone-container"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PhoneLoginForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="google-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GoogleLoginButton />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center px-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date().getFullYear()} {t('app.title')}. {t('app.description')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
