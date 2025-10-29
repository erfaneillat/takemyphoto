import { useTranslation } from '@/shared/hooks';
import { BillingCycle } from '../hooks';

interface BillingToggleProps {
  billingCycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export const BillingToggle = ({ billingCycle, onChange }: BillingToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
      <button
        onClick={() => onChange('monthly')}
        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
          billingCycle === 'monthly'
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {t('subscription.monthly')}
      </button>

      <button
        onClick={() => onChange('yearly')}
        className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
          billingCycle === 'yearly'
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {t('subscription.yearly')}
        <span className="absolute -top-2 -right-1 sm:-right-2 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
          {t('subscription.save60')}
        </span>
      </button>
    </div>
  );
};
