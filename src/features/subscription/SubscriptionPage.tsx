import { useState } from 'react';
import { Star, Shield, Zap, Users, Check, Sparkles, Crown, ArrowLeft, Rocket } from 'lucide-react';
import { useTranslation, useRegion } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { useSubscriptionState } from './hooks';

export const SubscriptionPage = () => {
  const { t } = useTranslation();
  const { isIran } = useRegion();
  const { user } = useAuthStore();
  const {
    plans,
    billingCycle,
    isProcessing,
    setBillingCycle,
    subscribeToPlan,
  } = useSubscriptionState();

  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  const proPlan = plans.find(p => p.id === 'pro');
  const freePlan = plans.find(p => p.id === 'free');

  const benefits = [
    {
      icon: Zap,
      title: t('subscription.benefits.faster.title'),
      description: t('subscription.benefits.faster.description'),
    },
    {
      icon: Shield,
      title: t('subscription.benefits.priority.title'),
      description: t('subscription.benefits.priority.description'),
    },
    {
      icon: Star,
      title: t('subscription.benefits.quality.title'),
      description: t('subscription.benefits.quality.description'),
    },
    {
      icon: Users,
      title: t('subscription.benefits.support.title'),
      description: t('subscription.benefits.support.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a] pb-24 lg:pb-32" dir={isIran ? 'rtl' : 'ltr'}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-sm">
            <Rocket className="w-4 h-4" />
            <span>{t('subscription.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            {t('subscription.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Billing Toggle - Modern Design */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <div className="relative inline-flex items-center p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-900/80 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ${billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {t('subscription.monthly')}
            </button>

            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ${billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {t('subscription.yearly')}
            </button>

            {/* Discount Badge */}
            <div className="absolute -top-3 sm:-top-4 -right-2 sm:-right-3 rtl:-left-2 rtl:sm:-left-3 rtl:right-auto">
              <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] sm:text-xs font-black rounded-full shadow-lg transform rotate-3 rtl:-rotate-3 animate-pulse">
                {t('subscription.discountBadge')}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards - Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-16 sm:mb-24">
          {/* Free Plan */}
          {freePlan && (
            <div
              onMouseEnter={() => setHoveredPlan('free')}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-white dark:bg-gray-900/50 rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 ${hoveredPlan === 'free'
                ? 'border-gray-300 dark:border-gray-600 shadow-2xl scale-[1.02]'
                : 'border-gray-200 dark:border-gray-800 shadow-lg'
                }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {t('subscription.plans.free.name')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isIran ? 'شروع رایگان' : 'Get started free'}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                    {isIran ? 'رایگان' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8">
                {freePlan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t(`subscription.plans.free.features.${feature}`)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                disabled={user?.subscription === 'free'}
                className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl text-base sm:text-lg font-bold transition-all ${user?.subscription === 'free'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
              >
                {user?.subscription === 'free' ? t('subscription.currentPlan') : t('subscription.selectPlan')}
              </button>
            </div>
          )}

          {/* Pro Plan - Featured */}
          {proPlan && (
            <div
              onMouseEnter={() => setHoveredPlan('pro')}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-900 rounded-3xl p-6 sm:p-8 border-2 border-blue-500/50 transition-all duration-500 overflow-hidden ${hoveredPlan === 'pro' ? 'shadow-2xl shadow-blue-500/25 scale-[1.02]' : 'shadow-xl shadow-blue-500/10'
                }`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              </div>

              {/* Popular Badge */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 rtl:left-4 rtl:sm:left-6 rtl:right-auto">
                <div className="px-3 sm:px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-bold rounded-full border border-white/30">
                  ⭐ {t('subscription.popular')}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {t('subscription.plans.pro.name')}
                    </h3>
                    <p className="text-sm text-blue-200">
                      {billingCycle === 'yearly'
                        ? t('subscription.plans.pro.features.creditsYearly')
                        : t('subscription.plans.pro.features.creditsMonthly')}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {formatPrice(billingCycle === 'yearly' ? proPlan.yearlyPrice : proPlan.monthlyPrice)}
                    </span>
                    <span className="text-lg sm:text-xl font-medium text-blue-200">
                      {isIran ? 'تومان' : '€'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-200 mt-1">
                    {billingCycle === 'yearly' ? (isIran ? 'سالانه' : 'per year') : (isIran ? 'ماهانه' : 'per month')}
                  </p>

                  {/* Yearly Savings */}
                  {billingCycle === 'yearly' && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                      <span className="text-xs sm:text-sm font-bold text-emerald-300">
                        {isIran
                          ? `${formatPrice(proPlan.monthlyPrice * 12 - proPlan.yearlyPrice)} تومان صرفه‌جویی`
                          : `Save €${((proPlan.monthlyPriceEur || 0) * 12 - (proPlan.yearlyPriceEur || 0)).toFixed(2)}`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4 mb-8">
                  {proPlan.features.map((feature) => {
                    let featureText = t(`subscription.plans.pro.features.${feature}`);
                    if (feature === 'credits') {
                      featureText = billingCycle === 'yearly'
                        ? t('subscription.plans.pro.features.creditsYearly')
                        : t('subscription.plans.pro.features.creditsMonthly');
                    }
                    return (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-white/90">
                          {featureText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => subscribeToPlan('pro')}
                  disabled={isProcessing}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
                      {t('subscription.processing')}
                    </>
                  ) : (
                    <>
                      {t('subscription.selectPlan')}
                      <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-24">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('subscription.whyUpgrade')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('subscription.whyUpgradeSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Section */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 sm:p-10 border border-emerald-200 dark:border-emerald-800/50 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-5 sm:mb-6">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('subscription.moneyBackGuarantee')}
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                {t('subscription.faq.description')}
              </p>
              <button className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                {t('subscription.faq.contactButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
