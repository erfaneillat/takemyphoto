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

  const features = [
    {
      icon: Zap,
      title: t('subscription.benefits.faster.title'),
      description: t('subscription.benefits.faster.description'),
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Shield,
      title: t('subscription.benefits.priority.title'),
      description: t('subscription.benefits.priority.description'),
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Star,
      title: t('subscription.benefits.quality.title'),
      description: t('subscription.benefits.quality.description'),
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Users,
      title: t('subscription.benefits.support.title'),
      description: t('subscription.benefits.support.description'),
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0B0B] pb-20 font-persian" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800">
            <Star className="w-4 h-4 fill-current" />
            <span>{t('subscription.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {t('subscription.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <BillingToggle billingCycle={billingCycle} onChange={setBillingCycle} />

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
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

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('subscription.whyUpgrade')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ / Trust Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] p-8 sm:p-12 border border-gray-200 dark:border-gray-800 text-center shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('subscription.moneyBackGuarantee')}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                {t('subscription.faq.description')}
              </p>
              <button className="w-full sm:w-auto px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-95">
                {t('subscription.faq.contactButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

