import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PaymentResultOverlay = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const payment = searchParams.get('payment');
    const refId = searchParams.get('refId');

    if (!payment) return null;

    const dismiss = () => {
        // Remove payment params and navigate clean
        searchParams.delete('payment');
        searchParams.delete('refId');
        searchParams.delete('msg');
        setSearchParams(searchParams, { replace: true });
    };

    const goToInvoices = () => {
        navigate('/app/invoices');
    };

    const config = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/30',
            borderColor: 'border-green-200 dark:border-green-800/40',
            title: 'پرداخت موفق',
            description: 'پرداخت شما با موفقیت انجام شد و حساب شما فعال گردید.',
            refLabel: refId ? `شماره پیگیری: ${refId}` : null,
        },
        failed: {
            icon: XCircle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800/40',
            title: 'پرداخت ناموفق',
            description: 'متأسفانه پرداخت انجام نشد. لطفاً دوباره تلاش کنید.',
            refLabel: null,
        },
        cancelled: {
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            borderColor: 'border-amber-200 dark:border-amber-800/40',
            title: 'پرداخت لغو شد',
            description: 'پرداخت توسط شما لغو شد. می‌توانید دوباره اقدام کنید.',
            refLabel: null,
        },
        error: {
            icon: AlertTriangle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800/40',
            title: 'خطا در پرداخت',
            description: 'خطایی در فرآیند پرداخت رخ داد. لطفاً با پشتیبانی تماس بگیرید.',
            refLabel: null,
        },
    }[payment] || null;

    if (!config) return null;

    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/50 dark:bg-black/70 flex items-center justify-center p-6"
                onClick={dismiss}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-sm rounded-2xl border ${config.borderColor} ${config.bgColor} p-8 text-center`}
                    dir="rtl"
                >
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${config.iconColor}`}>
                        <Icon size={48} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                        {config.title}
                    </h2>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                        {config.description}
                    </p>

                    {config.refLabel && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl py-2.5 px-4 mb-5 border border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">شماره پیگیری</p>
                            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white" dir="ltr">{refId}</p>
                        </div>
                    )}

                    <div className="space-y-2.5 mt-5">
                        {payment === 'success' ? (
                            <button
                                onClick={dismiss}
                                className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-bold active:scale-[0.98] transition-transform"
                            >
                                ادامه به برنامه
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={goToInvoices}
                                    className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold active:scale-[0.98] transition-transform"
                                >
                                    بازگشت به فاکتورها
                                </button>
                                <button
                                    onClick={dismiss}
                                    className="w-full py-3 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400"
                                >
                                    بستن
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
