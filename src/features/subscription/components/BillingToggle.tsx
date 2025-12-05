import { useTranslation } from '@/shared/hooks';
import { BillingCycle } from '../hooks';

interface BillingToggleProps {
  billingCycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export const BillingToggle = ({ billingCycle, onChange }: BillingToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center mb-12">
      <div className="relative flex items-center bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl shadow-inner">
        <button
          onClick={() => onChange('monthly')}
          className={`relative z-10 px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 ${billingCycle === 'monthly'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          {t('subscription.monthly')}
        </button>

        <button
          onClick={() => onChange('yearly')}
          className={`relative z-10 px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 ${billingCycle === 'yearly'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          {t('subscription.yearly')}
        </button>

        <div className="absolute -left-4 -top-5 bg-[#10B981] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg transform -rotate-12 z-20 border-2 border-white dark:border-[#0B0B0B]">
          {t('subscription.discountBadge')}
        </div>
      </div>
    </div>
  );
};
