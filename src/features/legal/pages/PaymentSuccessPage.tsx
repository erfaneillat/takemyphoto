import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  // Support both Yekpay (reference) and Zarinpal (refId)
  const reference = searchParams.get('reference') || searchParams.get('refId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Refresh user data to get updated subscription status
    refreshUser();
  }, [reference, orderId, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-surface-card rounded-2xl shadow-xl border border-gray-200 dark:border-border-light p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('payment.success.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {t('payment.success.description')}
          </p>

          {/* Payment Details */}
          {reference && (
            <div className="bg-gray-50 dark:bg-surface rounded-lg p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('payment.success.reference')}
                  </span>
                  <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {reference}
                  </span>
                </div>
                {orderId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('payment.success.orderId')}
                    </span>
                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {orderId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('payment.success.info')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {t('payment.success.goProfile')}
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {t('payment.success.goHome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
