import { useState } from 'react';

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
      monthlyPrice: 4.99,
      yearlyPrice: 23.88, // $1.99/month: 1.99 * 12 = 23.88 (~60% off)
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
      // TODO: Implement actual subscription logic
      console.log('Subscribing to plan:', planId, 'with billing cycle:', billingCycle);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Here you would call your backend API to create subscription
      // const response = await subscriptionApi.subscribe({ planId, billingCycle });
      
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
