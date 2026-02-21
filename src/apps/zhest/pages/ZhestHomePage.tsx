import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ZhestSearchPage } from './ZhestSearchPage';
import { ZhestGeneratePage } from './ZhestGeneratePage';
import { ZhestGalleryPage } from './ZhestGalleryPage';
import { ZhestProfilePage } from './ZhestProfilePage';

export const ZhestHomePage = () => {
    const { activeTab } = useHomeTabStore();

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors">
            <AnimatePresence mode="wait">
                {activeTab === 0 && (
                    <motion.div
                        key="search"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ZhestSearchPage />
                    </motion.div>
                )}

                {activeTab === 1 && (
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ZhestGeneratePage />
                    </motion.div>
                )}

                {activeTab === 2 && (
                    <motion.div
                        key="gallery"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ZhestGalleryPage />
                    </motion.div>
                )}

                {activeTab === 3 && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ZhestProfilePage />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

