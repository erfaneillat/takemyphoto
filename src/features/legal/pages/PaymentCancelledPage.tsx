import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const PaymentCancelledPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950/20 dark:to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-surface-card rounded-2xl shadow-xl border border-gray-200 dark:border-border-light p-8 md:p-12 text-center">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <AlertCircle className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Cancelled Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('payment.cancelled.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {t('payment.cancelled.description')}
          </p>

          {/* Info Message */}
          <div className="bg-gray-50 dark:bg-surface rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('payment.cancelled.info')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/checkout')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <RefreshCw size={20} />
              {t('payment.cancelled.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              {t('payment.cancelled.goHome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
