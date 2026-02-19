import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { useTranslation } from '@/shared/hooks';
import { Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HomePage = () => {
    const { activeTab } = useHomeTabStore();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors">
            <AnimatePresence mode="wait">
                {activeTab === 0 ? (
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                            <Sparkles size={36} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('home.searchGenerate.title')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                            {t('home.searchGenerate.description')}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                            <User size={36} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('home.profile.title')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                            {t('home.profile.description')}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
