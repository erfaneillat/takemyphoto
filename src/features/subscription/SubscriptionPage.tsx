import { Star, Shield, Zap, Users } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { useSubscriptionState } from './hooks';
import { PricingCard, BillingToggle } from './components';

export const SubscriptionPage = () => {
  const { t } = useTranslation();
  const {
    plans,
    billingCycle,
    selectedPlan,
    isProcessing,
    setBillingCycle,
    selectPlan,
    subscribeToPlan,
  } = useSubscriptionState();

  const benefits = [
    {
      icon: Zap,
      title: t('subscription.benefits.faster.title'),
      description: t('subscription.benefits.faster.description'),
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: t('subscription.benefits.priority.title'),
      description: t('subscription.benefits.priority.description'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Star,
      title: t('subscription.benefits.quality.title'),
      description: t('subscription.benefits.quality.description'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: t('subscription.benefits.support.title'),
      description: t('subscription.benefits.support.description'),
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-surface dark:to-surface-card pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 mb-4 sm:mb-6">
            <Star size={14} className="sm:size-4 text-blue-600 dark:text-cyan-400" />
            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-cyan-400">
              {t('subscription.badge')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 px-4">
            {t('subscription.title')}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <BillingToggle billingCycle={billingCycle} onChange={setBillingCycle} />

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isSelected={selectedPlan === plan.id}
              isProcessing={isProcessing}
              onSelect={() => selectPlan(plan.id)}
              onSubscribe={() => subscribeToPlan(plan.id)}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              {t('subscription.whyUpgrade')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t('subscription.whyUpgradeSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group bg-white dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} p-3 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center px-4">
          <div className="inline-block w-full max-w-3xl p-6 sm:p-8 lg:p-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('subscription.faq.title')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-2xl mx-auto">
              {t('subscription.faq.description')}
            </p>
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300">
              {t('subscription.faq.contactButton')}
            </button>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
            <Shield size={16} className="sm:size-5 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
              {t('subscription.moneyBackGuarantee')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
