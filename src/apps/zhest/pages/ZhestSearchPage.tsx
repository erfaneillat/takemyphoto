import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/hooks';
import { shopCategoryApi, ShopCategory } from '@/shared/services/templateApi';
import { useLicenseStore } from '@/apps/zhest/stores/useLicenseStore';
import { useReferenceImageStore } from '@/apps/zhest/stores/useReferenceImageStore';
import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { CategoryFilter } from '@/features/explore/components';
import { X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

interface SampleImageItem {
    url: string;
    publicId: string;
    categoryName: string;
    categoryIcon?: string;
}

export const ZhestSearchPage = () => {
    const { t } = useTranslation();
    const shopTypes = useLicenseStore((state) => state.shopTypes);
    const setReferenceImageUrl = useReferenceImageStore((s) => s.setReferenceImageUrl);
    const setActiveTab = useHomeTabStore((s) => s.setActiveTab);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [activeTab, setActiveTabLocal] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [columnCount, setColumnCount] = useState(2);
    const [selectedImage, setSelectedImage] = useState<SampleImageItem | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const computeCols = () => {
            if (typeof window === 'undefined') return 2;
            const w = window.innerWidth;
            if (w >= 1280) return 6;
            if (w >= 1024) return 5;
            if (w >= 768) return 4;
            if (w >= 640) return 3;
            return 2;
        };
        const onResize = () => setColumnCount(computeCols());
        setColumnCount(computeCols());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await shopCategoryApi.getShopCategories(shopTypes);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching shop categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Collect all sample images based on the active tab
    const images = useMemo<SampleImageItem[]>(() => {
        if (activeTab === 'all') {
            return categories.flatMap(cat =>
                (cat.sampleImages || []).map(img => ({
                    ...img,
                    categoryName: cat.name,
                    categoryIcon: cat.icon,
                }))
            );
        }
        const cat = categories.find(c => c.slug === activeTab);
        if (!cat) return [];
        return (cat.sampleImages || []).map(img => ({
            ...img,
            categoryName: cat.name,
            categoryIcon: cat.icon,
        }));
    }, [categories, activeTab]);

    // Distribute images across columns for masonry-like layout
    const distributedColumns = useMemo(() => {
        const cols: SampleImageItem[][] = Array.from({ length: columnCount }, () => []);
        images.forEach((img, i) => {
            cols[i % columnCount].push(img);
        });
        return cols;
    }, [images, columnCount]);

    const handleUseAsReference = () => {
        if (!selectedImage) return;
        setReferenceImageUrl(`${API_BASE}${selectedImage.url}`);
        setSelectedImage(null);
        setActiveTab(1);
    };

    return (
        <div className="flex flex-col w-full">
            {/* Categories */}
            <CategoryFilter
                categories={categories}
                activeTab={activeTab}
                onTabChange={setActiveTabLocal}
            />

            {/* Image Grid */}
            {isLoading ? (
                <div className="flex gap-3 p-4">
                    {Array.from({ length: columnCount }).map((_, ci) => (
                        <div key={ci} className="flex flex-col gap-3 flex-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                                    style={{ height: `${150 + Math.random() * 100}px` }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('explore.noResults') || 'No results found'}
                    </p>
                </div>
            ) : (
                <div className="flex gap-3 p-4">
                    {distributedColumns.map((col, ci) => (
                        <div key={ci} className="flex flex-col gap-3 flex-1">
                            {col.map((img) => (
                                <div
                                    key={img.publicId}
                                    className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={`${API_BASE}${img.url}`}
                                        alt={img.categoryName}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Image */}
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            src={`${API_BASE}${selectedImage.url}`}
                            alt={selectedImage.categoryName}
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Category label */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/70 text-sm mt-3 mb-4"
                        >
                            {selectedImage.categoryName}
                        </motion.p>

                        {/* Use as Reference button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUseAsReference();
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all active:scale-95"
                        >
                            <Sparkles size={18} />
                            {t('explore.useAsReference') || 'Use as Reference'}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
