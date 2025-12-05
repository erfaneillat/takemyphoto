import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation, useRegion } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { ShoppingCart, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const { isIran } = useRegion();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [planInfo, setPlanInfo] = useState<{ planId?: string; billingCycle?: string; price?: string; gateway?: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
  });

  // Auto-fill form with user data on mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    // Extract plan info from URL params
    const planId = searchParams.get('planId');
    const billingCycle = searchParams.get('billingCycle');
    const price = searchParams.get('price');
    const gateway = searchParams.get('gateway');

    if (planId) {
      setPlanInfo({ planId, billingCycle: billingCycle || 'monthly', price: price || '0', gateway: gateway || undefined });
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('checkout.validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('checkout.validation.lastNameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('checkout.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('checkout.validation.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.validation.phoneRequired');
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('checkout.validation.phoneInvalid');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('checkout.validation.addressRequired');
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('checkout.validation.postalCodeRequired');
    } else if (formData.postalCode.trim().length < 5) {
      newErrors.postalCode = t('checkout.validation.postalCodeInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      // Determine which payment gateway to use
      const useZarinpal = isIran || planInfo?.gateway === 'zarinpal';

      if (useZarinpal) {
        // Zarinpal payment for Iran (amount in Rials)
        const paymentData = {
          ...formData,
          amount: parseInt(planInfo?.price || '0'), // Amount in Rials
          planId: planInfo?.planId,
          billingCycle: planInfo?.billingCycle,
          description: `خرید اشتراک ${planInfo?.planId || ''} - ${planInfo?.billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}`,
        };

        const response = await fetch(`${apiBase}/zarinpal/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
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
        // Yekpay payment for Global (amount in EUR)
        const paymentData = {
          ...formData,
          amount: parseFloat(planInfo?.price || '0'),
          planId: planInfo?.planId,
          billingCycle: planInfo?.billingCycle,
          fromCurrencyCode: 978, // EUR
          toCurrencyCode: 978, // EUR
          country: 'Germany',
          city: 'Berlin',
          description: `Subscription Payment - ${planInfo?.planId || 'Plan'}`,
        };

        const response = await fetch(`${apiBase}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
          throw new Error(result.message || 'Failed to initiate payment');
        }

        // Redirect to Yekpay payment gateway
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          throw new Error('Payment URL not received');
        }
      }
    } catch (error: any) {
      console.error('Checkout form error:', error);
      setStatus('error');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <ShoppingCart className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            {t('checkout.title')}
            {!isIran && (
              <span className="text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                Global
              </span>
            )}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('checkout.subtitle')}
          </p>
        </div>

        {/* Plan Summary */}
        {planInfo && planInfo.planId && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('checkout.selectedPlan')}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {planInfo.planId}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('checkout.price')}
                </p>
                {isIran || planInfo.gateway === 'zarinpal' ? (
                  <p className="text-3xl font-bold text-blue-600 dark:text-cyan-400">
                    {(parseInt(planInfo.price || '0') / 10).toLocaleString('fa-IR')}
                    <span className="text-lg mr-1">تومان</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                      /{planInfo.billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}
                    </span>
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-blue-600 dark:text-cyan-400">
                    €{planInfo.price}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      /{planInfo.billingCycle === 'yearly' ? t('checkout.year') : t('checkout.month')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-6 mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            {t('checkout.description')}
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                  {t('checkout.success.title')}
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {t('checkout.success.description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
                  {t('checkout.error.title')}
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  {t('checkout.error.description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('checkout.form.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('checkout.form.firstNamePlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.firstName
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-border-light'
                    } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('checkout.form.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('checkout.form.lastNamePlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.lastName
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-border-light'
                    } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('checkout.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('checkout.form.emailPlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-border-light'
                  } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('checkout.form.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('checkout.form.phonePlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.phone
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-border-light'
                  } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('checkout.form.address')}
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder={t('checkout.form.addressPlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.address
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-border-light'
                  } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white resize-none`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('checkout.form.postalCode')}
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder={t('checkout.form.postalCodePlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.postalCode
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-border-light'
                  } bg-white dark:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors text-gray-900 dark:text-white`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.postalCode}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('checkout.form.submitting')}
                </>
              ) : (
                <>
                  <Send size={20} />
                  {t('checkout.form.submit')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
