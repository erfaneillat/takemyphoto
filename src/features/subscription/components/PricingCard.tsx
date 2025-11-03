import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { Plan, BillingCycle } from '../hooks';

interface PricingCardProps {
  plan: Plan;
  billingCycle: BillingCycle;
  isSelected: boolean;
  isProcessing: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
}

const iconMap = {
  Sparkles: Sparkles,
  Zap: Zap,
  Crown: Crown,
};

export const PricingCard = ({
  plan,
  billingCycle,
  isSelected,
  isProcessing,
  onSelect,
  onSubscribe,
}: PricingCardProps) => {
  const { t } = useTranslation();
  const Icon = iconMap[plan.icon as keyof typeof iconMap];
  
  const monthlyPrice = plan.monthlyPrice;
  const yearlyPrice = plan.yearlyPrice;
  const yearlyMonthlyEquivalent = (plan.yearlyPrice / 12).toFixed(2);
  const originalYearlyPrice = (plan.monthlyPrice * 12).toFixed(2);
  const displayPrice = billingCycle === 'yearly' ? yearlyPrice.toFixed(2) : monthlyPrice.toFixed(2);
  const yearlySavings = Math.max(0, plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(2);
  const isFree = plan.id === 'free';

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white dark:bg-surface-card rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer group flex flex-col ${
        isSelected
          ? 'border-blue-500 dark:border-cyan-500 shadow-2xl sm:scale-105'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl'
      } ${plan.popular ? 'ring-2 ring-blue-500/20 dark:ring-cyan-500/20' : ''}`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
          <div className="px-3 sm:px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg">
            {t('subscription.popular')}
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${plan.color} p-3 sm:p-3.5 lg:p-4 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
        >
          <Icon className="w-full h-full text-white" />
        </div>
      </div>

      {/* Plan Name */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {t(`subscription.plans.${plan.translationKey}.name`)}
      </h3>

      {/* Price */}
      {billingCycle === 'monthly' ? (
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            €{displayPrice}
          </span>
          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isFree ? '' : `/${t('subscription.month')}`}
          </span>
        </div>
      ) : (
        <div className="mb-4">
          {/* Yearly Total Price */}
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              €{displayPrice}
            </span>
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {isFree ? '' : `/${t('subscription.year')}`}
            </span>
          </div>
          
          {/* Monthly Equivalent Subtitle */}
          {!isFree && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-2">
              (€{yearlyMonthlyEquivalent}/{t('subscription.perMonth')})
            </p>
          )}
          
          {/* Original Price with Strikethrough */}
          {!isFree && parseFloat(yearlySavings) > 0 && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-lg text-gray-500 dark:text-gray-500 line-through">
                €{originalYearlyPrice}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Billing Note */}
      {billingCycle === 'yearly' && !isFree && parseFloat(yearlySavings) > 0 && (
        <p className="text-sm text-center text-green-600 dark:text-green-400 mb-6">
          {t('subscription.saveYearly', { amount: `€${yearlySavings}` })}
        </p>
      )}

      {/* Features */}
      <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 mt-4 sm:mt-6 flex-grow">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 sm:gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400" />
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {t(`subscription.plans.${plan.translationKey}.features.${feature}`)}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isFree) {
            onSubscribe();
          }
        }}
        disabled={isFree || (isProcessing && isSelected)}
        className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 ${
          isFree
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : isSelected
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
        }`}
      >
        {isFree
          ? t('subscription.currentPlan')
          : isProcessing && isSelected
          ? t('subscription.processing')
          : t('subscription.selectPlan')}
      </button>
    </div>
  );
};
