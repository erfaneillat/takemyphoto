import { useLicenseStore } from '../stores/useLicenseStore';
import { ShieldX, Clock, Phone } from 'lucide-react';

export const LicenseExpiredPage = () => {
    const { shopName, licenseKey, reset } = useLicenseStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full text-center">
                {/* Expired Icon */}
                <div className="relative mb-6 inline-flex">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/30">
                        <ShieldX size={48} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <Clock size={16} className="text-white" />
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
                <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-red-200/50 dark:border-red-800/30">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">کلید لایسنس</span>
                        <span dir="ltr" className="font-mono font-bold text-gray-900 dark:text-white">
                            {licenseKey || '---'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">وضعیت</span>
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            منقضی شده
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <a
                        href="tel:+989000000000"
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
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
