import { useState, useEffect, useMemo } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { shopProductImageApi, ShopGeneratedImage } from '@/shared/services/shopProductImageApi';
import { Sparkles, Download, Loader2, ImageIcon } from 'lucide-react';

export const ZhestGalleryPage = () => {
    const { licenseKey } = useLicenseStore();
    const [images, setImages] = useState<ShopGeneratedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [columnCount, setColumnCount] = useState(2);

    useEffect(() => {
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

    useEffect(() => {
        const computeCols = () => {
            if (typeof window === 'undefined') return 2;
            const w = window.innerWidth;
            if (w >= 1024) return 4;
            if (w >= 768) return 3;
            return 2;
        };
        const onResize = () => setColumnCount(computeCols());
        setColumnCount(computeCols());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const completedImages = useMemo(() => images.filter(img => img.status === 'completed'), [images]);

    const distributedColumns = useMemo(() => {
        const cols: ShopGeneratedImage[][] = Array.from({ length: columnCount }, () => []);
        completedImages.forEach((img, i) => {
            cols[i % columnCount].push(img);
        });
        return cols;
    }, [completedImages, columnCount]);

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

    return (
        <div className="min-h-screen bg-white dark:bg-black pb-20 lg:pb-8 transition-colors" dir="rtl">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <ImageIcon size={24} className="text-blue-500" />
                        گالری من
                        {images.length > 0 && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm px-2.5 py-0.5 rounded-full font-medium">
                                {images.length} تصویر
                            </span>
                        )}
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <Sparkles size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                                هنوز تصویری تولید نشده است
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                از تب «تولید» اولین تصویر خود را بسازید
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            {distributedColumns.map((col, ci) => (
                                <div key={ci} className="flex flex-col gap-4 flex-1">
                                    {col.map((image) => {
                                        const index = completedImages.indexOf(image);
                                        return (
                                            <div
                                                key={image.id}
                                                className="group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <img
                                                    src={image.imageUrl}
                                                    alt={`Generated ${index + 1}`}
                                                    className="w-full h-auto block"
                                                    loading="lazy"
                                                />
                                                {/* Hover overlay with download */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={() => handleDownload(image.imageUrl, index)}
                                                        className="px-4 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                                                    >
                                                        <Download size={16} />
                                                        دانلود
                                                    </button>
                                                </div>
                                                {/* Date badge */}
                                                <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 text-white text-[11px] font-medium rounded-lg backdrop-blur-md">
                                                    {new Date(image.createdAt).toLocaleDateString('fa-IR')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
