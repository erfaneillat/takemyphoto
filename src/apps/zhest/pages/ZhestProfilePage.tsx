import { useEffect } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { Store, KeyRound, Clock, MapPin, Phone, User } from 'lucide-react';

export const ZhestProfilePage = () => {
    const { shopName, shopTypes, licenseKey, remainingDays, refreshLicenseInfo, phoneNumber, address, ownerName } = useLicenseStore();
    useEffect(() => {
        // Refresh license info from server (to get latest licenseExpiresAt)
        refreshLicenseInfo();
    }, []);



    const typeLabels: Record<string, string> = {
        gold: 'طلا و جواهر',
        clothes: 'پوشاک',
        watch: 'ساعت',
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black pb-20 lg:pb-8 transition-colors" dir="rtl">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Shop Info Card */}
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-5 mb-5 border border-gray-200 dark:border-gray-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg shadow-gray-900/10 dark:shadow-white/10">
                            <Store size={24} className="text-white dark:text-gray-900" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {shopName || 'فروشگاه'}
                            </h2>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {shopTypes.map((type) => (
                                    <span
                                        key={type}
                                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                    >
                                        {typeLabels[type] || type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {(ownerName || phoneNumber || address) && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/50 space-y-2">
                            {ownerName && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <User size={16} className="text-gray-400" />
                                    <span>{ownerName}</span>
                                </div>
                            )}
                            {phoneNumber && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Phone size={16} className="text-gray-400" />
                                    <span dir="ltr">{phoneNumber}</span>
                                </div>
                            )}
                            {address && (
                                <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                    <span className="leading-relaxed">{address}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {/* License key + status row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/50">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <KeyRound size={14} />
                            <span dir="ltr" className="font-mono font-bold text-gray-900 dark:text-white">
                                {licenseKey || '---'}
                            </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            فعال
                        </span>
                    </div>
                    {/* Remaining days */}
                    {(() => {
                        const days = remainingDays();
                        if (days === null) return null;
                        const colorClass = days <= 7
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30'
                            : days <= 30
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30';
                        return (
                            <div className={`flex items-center justify-center gap-2 mt-3 py-2 px-3 rounded-xl border ${colorClass}`}>
                                <Clock size={14} />
                                <span className="text-sm font-semibold">
                                    {days} روز باقی‌مانده
                                </span>
                            </div>
                        );
                    })()}
                </div>




            </div>
        </div>
    );
};
