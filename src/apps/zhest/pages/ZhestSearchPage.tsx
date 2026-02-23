import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/shared/hooks';
import { shopCategoryApi, ShopCategory } from '@/shared/services/templateApi';
import { useLicenseStore } from '@/apps/zhest/stores/useLicenseStore';
import { useReferenceImageStore } from '@/apps/zhest/stores/useReferenceImageStore';
import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { CategoryFilter } from '@/features/explore/components';
import { ComingSoonSection } from '../components/ComingSoonSection';
import { X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveApiBase } from '@/shared/services/api';

const API_BASE = resolveApiBase().replace(/\/api(\/v1)?\/?$/, '');

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
            const allImages = categories.flatMap(cat =>
                (cat.sampleImages || []).map(img => ({
                    ...img,
                    categoryName: cat.name,
                    categoryIcon: cat.icon,
                }))
            );
            // Shuffle images randomly
            return allImages.sort(() => Math.random() - 0.5);
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
            {/* Coming Soon Features */}
            <ComingSoonSection />

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
                            {Array.from({ length: 4 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: ci * 0.1 + i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                                    className="bg-gray-200 dark:bg-gray-800/60 rounded-2xl relative overflow-hidden"
                                    style={{ height: `${180 + ((i + ci * 2) % 3) * 60}px` }}
                                >
                                    {/* Shimmer inside */}
                                    <motion.div
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent skew-x-12"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : images.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-12 mt-10 text-center"
                >
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 10 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
                        className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-gray-100 dark:ring-gray-700/50 shadow-inner"
                    >
                        <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {t('explore.noResultsTitle') || 'No templates found'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                        {t('explore.noResultsDesc') || 'We couldn\'t find any templates for this category. Try exploring other categories.'}
                    </p>
                </motion.div>
            ) : (
                <div className="flex gap-3 p-4">
                    {distributedColumns.map((col, ci) => (
                        <div key={ci} className="flex flex-col gap-3 flex-1">
                            {col.map((img) => (
                                <motion.div
                                    layoutId={`img-container-${img.publicId}`}
                                    key={img.publicId}
                                    className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-white/10 transition-shadow duration-300"
                                    onClick={() => setSelectedImage(img)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: (ci % 3) * 0.1 }}
                                >
                                    <motion.img
                                        layoutId={`img-${img.publicId}`}
                                        src={`${API_BASE}${img.url}`}
                                        alt={img.categoryName}
                                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4">
                                        <p className="text-white font-medium text-sm flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            {img.categoryIcon && <span>{img.categoryIcon}</span>}
                                            {img.categoryName}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 p-4 sm:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close button */}
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 backdrop-blur-md border border-white/10 shadow-lg"
                        >
                            <X size={24} />
                        </motion.button>

                        {/* Image Container */}
                        <motion.div
                            layoutId={`img-container-${selectedImage.publicId}`}
                            className="relative flex flex-col items-center justify-center max-w-full max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                layoutId={`img-${selectedImage.publicId}`}
                                src={`${API_BASE}${selectedImage.url}`}
                                alt={selectedImage.categoryName}
                                className="max-w-full max-h-[75vh] rounded-2xl"
                            />

                            {/* Overlay gradient inside image for text readability */}
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none rounded-b-2xl" />

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bottom-6 left-6 right-6 flex items-center justify-center pointer-events-none"
                            >
                                <p className="text-white font-medium text-lg drop-shadow-md flex items-center gap-2">
                                    {selectedImage.categoryIcon && <span>{selectedImage.categoryIcon}</span>}
                                    {selectedImage.categoryName}
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Use as Reference button */}
                        <motion.button
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUseAsReference();
                            }}
                            className="mt-8 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black hover:bg-gray-100 font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all active:scale-95 overflow-hidden relative group w-full max-w-sm"
                        >
                            {/* Shiny animate effect */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12"
                            />

                            <Sparkles size={20} className="text-gray-900 animate-pulse" />
                            <span>{t('explore.useAsReference') || 'Use as Reference'}</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
