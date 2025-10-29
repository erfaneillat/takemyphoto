import { useTranslation } from '@/shared/hooks';
import { Button } from '@/shared/components';
import { Check } from 'lucide-react';

export const UpgradePage = () => {
  const { t } = useTranslation();

  const plans = [
    {
      id: 'free',
      highlighted: false,
    },
    {
      id: 'pro',
      highlighted: true,
    },
    {
      id: 'premium',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('upgrade.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('app.description')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const planData = t(`upgrade.plans.${plan.id}`, { returnObjects: true }) as {
              name: string;
              price: string;
              features: string[];
            };

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-50 dark:bg-surface-card backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-gray-900 dark:border-white shadow-2xl shadow-gray-900/20 dark:shadow-white/20 scale-105'
                    : 'border-gray-200 dark:border-border-light hover:border-gray-900 dark:hover:border-white/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {planData.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {planData.price}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {planData.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check 
                        size={20} 
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} 
                      />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 hover:from-black dark:hover:from-gray-100 hover:to-black dark:hover:to-gray-300 shadow-lg text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-surface-hover text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {plan.id === 'free' ? t('common.welcome') : t('upgrade.upgradeNow')}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16 text-gray-600 dark:text-gray-400">
          <p>All plans include 14-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};
