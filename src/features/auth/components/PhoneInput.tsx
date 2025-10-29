import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
}

export const PhoneInput = ({ value, onChange, onSubmit, isLoading, error }: PhoneInputProps) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters except leading +
    let cleaned = input.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +98 (Iran country code)
    if (cleaned.startsWith('0')) {
      cleaned = '+98' + cleaned.slice(1);
    }
    // If doesn't start with +, prepend +98
    else if (!cleaned.startsWith('+')) {
      cleaned = '+98' + cleaned;
    }
    
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 sm:space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center"
        >
          {t('auth.login.phoneLabel')}
        </label>
        <div
          className={`
            relative flex items-center justify-center rounded-xl border-2 transition-all duration-200
            ${isFocused
              ? 'border-gray-900 dark:border-white shadow-lg'
              : 'border-gray-200 dark:border-gray-700'
            }
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        >
          <div className="absolute left-3 sm:left-4">
            <Phone
              size={20}
              className={`transition-colors ${
                isFocused
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            />
          </div>
          <input
            id="phone"
            type="tel"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('auth.login.phonePlaceholder')}
            className="w-full py-3.5 sm:py-4 px-10 sm:px-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base sm:text-lg text-center"
            disabled={isLoading}
            autoComplete="tel"
            maxLength={15}
            dir="ltr"
          />
        </div>
        {error && (
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !value}
        className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] shadow-lg hover:shadow-xl touch-manipulation"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin" />
            {t('common.loading')}
          </span>
        ) : (
          t('auth.login.continueButton')
        )}
      </button>

      <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed">
        {t('auth.login.termsText')}{' '}
        <a href="/terms" className="text-gray-900 dark:text-white hover:underline font-medium">
          {t('auth.login.termsLink')}
        </a>{' '}
        {t('auth.login.and')}{' '}
        <a href="/privacy" className="text-gray-900 dark:text-white hover:underline font-medium">
          {t('auth.login.privacyLink')}
        </a>
      </p>
    </form>
  );
};
