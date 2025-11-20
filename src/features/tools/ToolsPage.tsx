import { useTranslation } from '@/shared/hooks';
import { useToolsState } from './hooks';
import { ToolCard } from './components';
import { Sparkles } from 'lucide-react';

export const ToolsPage = () => {
  const { t } = useTranslation();
  const { tools } = useToolsState();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 mb-6">
            <Sparkles size={16} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-cyan-400">
              {t('tools.badge')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('tools.title')}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('tools.subtitle')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('tools.moreComingSoon.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tools.moreComingSoon.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
