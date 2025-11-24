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
  const yearlyMonthlyEquivalent = Math.round(plan.yearlyPrice / 12);
  const originalYearlyPrice = plan.monthlyPrice * 12;
  const displayPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
  const yearlySavings = Math.max(0, plan.monthlyPrice * 12 - plan.yearlyPrice);
  const isFree = plan.id === 'free';

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white dark:bg-surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 cursor-pointer group flex flex-col ${isSelected
        ? 'border-blue-500 dark:border-cyan-500 shadow-2xl sm:scale-105 z-10'
        : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-cyan-900/30 hover:shadow-xl'
        } ${plan.popular ? 'ring-4 ring-blue-500/10 dark:ring-cyan-500/10' : ''}`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 sm:px-5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg tracking-wide">
            {t('subscription.popular')}
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${plan.color} p-3.5 sm:p-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-full h-full text-white" />
        </div>
      </div>

      {/* Plan Name */}
      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center mb-2 tracking-tight">
        {t(`subscription.plans.${plan.translationKey}.name`)}
      </h3>

      {/* Price */}
      {billingCycle === 'monthly' ? (
        <div className="flex flex-col items-center justify-center gap-1 mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {isFree ? 'رایگان' : formatPrice(displayPrice)}
            </span>
            {!isFree && (
              <span className="text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-400">
                تومان
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {isFree ? '' : `ماهانه`}
          </span>
        </div>
      ) : (
        <div className="mb-6 text-center">
          {/* Yearly Total Price */}
          <div className="flex flex-col items-center justify-center gap-1 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                {isFree ? 'رایگان' : formatPrice(displayPrice)}
              </span>
              {!isFree && (
                <span className="text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-400">
                  تومان
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {isFree ? '' : `سالانه`}
            </span>
          </div>

          {/* Monthly Equivalent Subtitle */}
          {!isFree && (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2 font-medium">
              (معادل {formatPrice(yearlyMonthlyEquivalent)} تومان / ماهانه)
            </p>
          )}

          {/* Original Price with Strikethrough */}
          {!isFree && yearlySavings > 0 && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-base sm:text-lg text-gray-400 dark:text-gray-600 line-through decoration-2 decoration-red-500/50">
                {formatPrice(originalYearlyPrice)}
              </span>
              <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-md">
                {Math.round((yearlySavings / originalYearlyPrice) * 100)}% تخفیف
              </div>
            </div>
          )}
        </div>
      )}

      {/* Billing Note */}
      {billingCycle === 'yearly' && !isFree && yearlySavings > 0 && (
        <p className="text-sm text-center text-emerald-600 dark:text-emerald-400 mb-6 font-bold bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">
          {formatPrice(yearlySavings)} تومان سود شما در پرداخت سالانه
        </p>
      )}

      {/* Features */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-6 sm:mb-8 flex-grow">
        <ul className="space-y-4">
          {plan.features.map((feature) => {
            let featureText = t(`subscription.plans.${plan.translationKey}.features.${feature}`);

            // Dynamic credit text based on billing cycle
            if (feature === 'credits') {
              featureText = billingCycle === 'yearly'
                ? t(`subscription.plans.${plan.translationKey}.features.creditsYearly`)
                : t(`subscription.plans.${plan.translationKey}.features.creditsMonthly`);
            }

            return (
              <li key={feature} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-cyan-400" />
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  {featureText}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isFree) {
            onSubscribe();
          }
        }}
        disabled={isFree || (isProcessing && isSelected)}
        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] ${isFree
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
          : isSelected
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
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
