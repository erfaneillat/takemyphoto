import { useState, useEffect } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { shopProductImageApi, ShopGeneratedImage } from '@/shared/services/shopProductImageApi';
import { Store, KeyRound, LogOut, Sparkles, Download, Loader2, ImageIcon, Clock } from 'lucide-react';

export const ZhestProfilePage = () => {
    const { shopName, shopTypes, licenseKey, reset, remainingDays, refreshLicenseInfo } = useLicenseStore();
    const [images, setImages] = useState<ShopGeneratedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Refresh license info from server (to get latest licenseExpiresAt)
        refreshLicenseInfo();

        if (!licenseKey) return;
        setLoading(true);
        shopProductImageApi.listImages(licenseKey)
            .then(setImages)
            .catch((err) => {
                console.error('Failed to load images:', err);
                setError('خطا در بارگذاری تصاویر');
            })
            .finally(() => setLoading(false));
    }, [licenseKey]);

    const handleDownload = async (imageUrl: string, index: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zhest-product-${index + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    const handleDeactivate = () => {
        if (window.confirm('آیا مطمئن هستید که می‌خواهید لایسنس را غیرفعال کنید؟')) {
            reset();
        }
    };

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

                {/* Generated Images Gallery */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                        <ImageIcon size={16} />
                        تصاویر تولید شده
                        {images.length > 0 && (
                            <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                                {images.length}
                            </span>
                        )}
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <Sparkles size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                هنوز تصویری تولید نشده است
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                از تب «تولید» اولین تصویر خود را بسازید
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {images.filter(img => img.status === 'completed').map((image, index) => (
                                <div
                                    key={image.id}
                                    className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-square"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={`Generated ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Hover overlay with download */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => handleDownload(image.imageUrl, index)}
                                            className="px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                                        >
                                            <Download size={14} />
                                            دانلود
                                        </button>
                                    </div>
                                    {/* Date badge */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-md backdrop-blur-sm">
                                        {new Date(image.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Deactivate Button */}
                <button
                    onClick={handleDeactivate}
                    className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                >
                    <LogOut size={16} />
                    غیرفعال‌سازی لایسنس
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
                    با غیرفعال‌سازی، نیاز به وارد کردن مجدد لایسنس خواهید داشت
                </p>
            </div>
        </div>
    );
};
