import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

interface CodeVerificationProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
  onBack: () => void;
  onResend: () => void;
  isLoading: boolean;
  error?: string;
}

export const CodeVerification = ({
  phoneNumber,
  onVerify,
  onBack,
  onResend,
  isLoading,
  error,
}: CodeVerificationProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every((digit) => digit) && index === 5) {
      onVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    
    while (newCode.length < 6) {
      newCode.push('');
    }
    
    setCode(newCode);
    
    if (pastedData.length === 6) {
      onVerify(pastedData);
    } else if (pastedData.length > 0) {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setResendTimer(60);
      setCanResend(false);
      onResend();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display: 0930 8699 4145
    if (phone.length === 11) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 8)} ${phone.slice(8)}`;
    } else if (phone.length === 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation -ml-1"
        disabled={isLoading}
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">{t('auth.verification.changeNumber')}</span>
      </button>

      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('auth.verification.subtitle')}
        </p>
        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
          {formatPhoneNumber(phoneNumber)}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste} dir="ltr">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              dir="ltr"
              className={`
                w-11 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl
                border-2 transition-all duration-200 outline-none
                bg-white dark:bg-gray-900
                ${digit
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                }
                ${error ? 'border-red-500 dark:border-red-500' : ''}
                focus:border-gray-900 dark:focus:border-white focus:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                touch-manipulation
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>

      <button
        onClick={() => onVerify(code.join(''))}
        disabled={isLoading || code.some((digit) => !digit)}
        className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] shadow-lg hover:shadow-xl touch-manipulation"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin" />
            {t('common.loading')}
          </span>
        ) : (
          t('auth.verification.verifyButton')
        )}
      </button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={!canResend || isLoading}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          <RefreshCw size={16} />
          {canResend ? (
            t('auth.verification.resendCode')
          ) : (
            <>
              {t('auth.verification.resendIn')} {resendTimer} {t('auth.verification.seconds')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
