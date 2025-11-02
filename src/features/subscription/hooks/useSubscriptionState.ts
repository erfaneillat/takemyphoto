import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type PlanType = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: PlanType;
  name: string;
  translationKey: string;
  monthlyPrice: number;
  yearlyPrice: number;
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      translationKey: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
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
      monthlyPrice: 5.99,
      yearlyPrice: 35.88, // €2.99/month: 2.99 * 12 = 35.88
      popular: true,
      features: [
        'unlimitedGenerations',
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
    setIsProcessing(true);
    try {
      // Navigate to checkout page with plan and billing cycle info
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        // Encode plan data in URL params for checkout page
        const checkoutParams = new URLSearchParams({
          planId: planId,
          billingCycle: billingCycle,
          price: billingCycle === 'yearly' ? plan.yearlyPrice.toString() : plan.monthlyPrice.toString()
        });
        navigate(`/checkout?${checkoutParams.toString()}`);
      }
      setSelectedPlan(null);
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
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
