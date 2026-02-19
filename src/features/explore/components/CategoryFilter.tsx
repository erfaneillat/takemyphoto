import { useTranslation } from '@/shared/hooks';
import { motion } from 'framer-motion';

interface CategoryItem {
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CategoryFilter = ({ categories, activeTab, onTabChange }: CategoryFilterProps) => {
  const { t } = useTranslation();

  const tabs = ['all', ...categories.map(cat => cat.slug)];

  const renderTab = (tab: string, isMobile: boolean) => {
    const category = categories.find(cat => cat.slug === tab);
    const displayName = tab === 'all' || tab === 'trending'
      ? t(`explore.tabs.${tab}`)
      : (category?.name || tab);

    const isActive = activeTab === tab;

    return (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`relative flex h-10 items-center justify-center gap-x-2 rounded-full px-5 transition-all duration-300 whitespace-nowrap font-medium text-sm group overflow-hidden ${isActive
          ? 'text-white dark:text-black'
          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        {/* Active Background Animation */}
        {isActive && (
          <motion.div
            layoutId={`active-tab-indicator${isMobile ? '-mobile' : ''}`}
            className="absolute inset-0 z-0 bg-gray-900 dark:bg-white rounded-full"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Inactive Hover Background */}
        {!isActive && (
          <div className="absolute inset-0 z-0 bg-gray-100 dark:bg-surface opacity-0 group-hover:opacity-100 dark:group-hover:bg-surface-hover rounded-full transition-opacity duration-300" />
        )}

        {/* Default border/bg for inactive to match old style but cleaner */}
        {!isActive && (
          <div className="absolute inset-0 z-0 bg-gray-50 dark:bg-surface/50 border border-gray-200 dark:border-white/10 rounded-full" />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {category?.icon && <span className="text-lg">{category.icon}</span>}
          {tab === 'all' && <span className="text-lg">✨</span>}
          <p>{displayName}</p>
        </span>
      </button>
    );
  };

  return (
    <div className="w-full relative">
      {/* Desktop - Flex Wrap Center */}
      <div className="hidden md:flex flex-wrap gap-3 p-4 justify-center">
        {tabs.map(tab => renderTab(tab, false))}
      </div>

      {/* Mobile - Horizontal Scroll with 2 Rows */}
      <div className="md:hidden overflow-x-auto scrollbar-hide py-4 px-3 relative w-full">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none" />

        <div className="grid grid-flow-col auto-cols-max gap-3 hide-scrollbar" style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
          {tabs.map((tab, index) => (
            <div key={tab} style={{ gridRow: (index % 2) + 1 }}>
              {renderTab(tab, true)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
