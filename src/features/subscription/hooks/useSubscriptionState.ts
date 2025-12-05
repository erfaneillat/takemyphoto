import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';

export type PlanType = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: PlanType;
  name: string;
  translationKey: string;
  monthlyPrice: number; // Price in Rials for Iran
  yearlyPrice: number; // Price in Rials for Iran
  monthlyPriceEur?: number; // Price in EUR for Global
  yearlyPriceEur?: number; // Price in EUR for Global
  popular?: boolean;
  features: string[];
  color: string;
  icon: string;
}

export interface SubscriptionState {
  plans: Plan[];
  billingCycle: BillingCycle;
  selectedPlan: PlanType | null;
  isProcessing: boolean;
  setBillingCycle: (cycle: BillingCycle) => void;
  selectPlan: (plan: PlanType) => void;
  subscribeToPlan: (planId: PlanType) => Promise<void>;
}

export const useSubscriptionState = (): SubscriptionState => {
  const navigate = useNavigate();
  const { isIran } = useRegion();
  const { user, isAuthenticated } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      translationKey: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyPriceEur: 0,
      yearlyPriceEur: 0,
      features: [
        'limitedGenerations',
        'basicImageGenerator',
        'basicPromptEditor',
        'basicImageUpscaler',
        'watermarkOnExports',
        'communitySupport'
      ],
      color: 'from-gray-500 to-gray-600',
      icon: 'Sparkles',
    },
    {
      id: 'pro',
      name: 'Pro',
      translationKey: 'pro',
      monthlyPrice: 498000, // 498,000 Toman (400 credits)
      yearlyPrice: 4980000, // 4,980,000 Toman (≈16.7% off compared to paying monthly)
      monthlyPriceEur: 4.99,
      yearlyPriceEur: 49.90, // 4.99 × 12 with 16.7% discount applied
      popular: true,
      features: [
        'credits',
        'allTools',
        'hdExport',
        'noWatermark',
        'fasterProcessing',
        'prioritySupport'
      ],
      color: 'from-blue-500 to-cyan-500',
      icon: 'Zap',
    },
  ];

  const selectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const subscribeToPlan = async (planId: PlanType) => {
    if (planId === 'free') {
      return;
    }

    setIsProcessing(true);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (isIran) {
        // For Iran: Direct payment with Zarinpal (no checkout form needed)
        // User must be logged in
        if (!isAuthenticated || !user) {
          navigate('/login?redirect=/subscription');
          return;
        }

        const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';

        // Call Zarinpal checkout directly with user data
        const response = await fetch(`${apiBase}/zarinpal/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: user.name?.split(' ')[0] || 'کاربر',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            amount: price,
            planId: planId,
            billingCycle: billingCycle,
            description: `خرید اشتراک ${planId} - ${billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}`,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
          throw new Error(result.message || 'خطا در ایجاد درخواست پرداخت');
        }

        // Redirect to Zarinpal payment gateway
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          throw new Error('آدرس درگاه پرداخت دریافت نشد');
        }
      } else {
        // For global users, navigate to checkout form (Yekpay)
        const price = billingCycle === 'yearly' ? (plan.yearlyPriceEur || 0) : (plan.monthlyPriceEur || 0);
        const checkoutParams = new URLSearchParams({
          planId: planId,
          billingCycle: billingCycle,
          price: price.toString(),
        });
        navigate(`/checkout?${checkoutParams.toString()}`);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error.message || 'خطا در پردازش درخواست');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    plans,
    billingCycle,
    selectedPlan,
    isProcessing,
    setBillingCycle,
    selectPlan,
    subscribeToPlan,
  };
};
