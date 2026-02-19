import { useLicenseStore } from '../stores/useLicenseStore';
import { ShieldX, Clock, Phone } from 'lucide-react';

export const LicenseExpiredPage = () => {
    const { shopName, licenseKey, reset } = useLicenseStore();

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0A0A0B] flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full text-center">
                {/* Expired Icon */}
                <div className="relative mb-6 inline-flex">
                    <div className="w-24 h-24 rounded-3xl bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg shadow-gray-900/20 dark:shadow-white/20">
                        <ShieldX size={48} className="text-white dark:text-gray-900" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-300 flex items-center justify-center shadow-lg">
                        <Clock size={16} className="text-white dark:text-gray-900" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    لایسنس منقضی شده است
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                    اعتبار لایسنس فروشگاه <strong className="text-gray-900 dark:text-white">{shopName || '---'}</strong> به پایان رسیده است.
                    <br />
                    برای ادامه استفاده لطفاً با پشتیبانی تماس بگیرید.
                </p>

                {/* License Info Card */}
                <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-gray-200/50 dark:border-gray-800/30">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">کلید لایسنس</span>
                        <span dir="ltr" className="font-mono font-bold text-gray-900 dark:text-white">
                            {licenseKey || '---'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">وضعیت</span>
                        <span className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                            منقضی شده
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <a
                        href="tel:+989000000000"
                        className="w-full py-3.5 px-6 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.16)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Phone size={18} />
                        تماس با پشتیبانی
                    </a>
                    <button
                        onClick={() => reset()}
                        className="w-full py-3 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        ورود با لایسنس جدید
                    </button>
                </div>
            </div>
        </div>
    );
};
