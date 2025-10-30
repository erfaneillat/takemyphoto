import { useTranslation } from '@/shared/hooks';
import { Category } from '@/shared/services/templateApi';

interface CategoryFilterProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CategoryFilter = ({ categories, activeTab, onTabChange }: CategoryFilterProps) => {
  const { t } = useTranslation();

  const tabs = ['all', 'trending', ...categories.map(cat => cat.slug)];

  return (
    <>
      {/* Desktop - Flex Wrap Center */}
      <div className="hidden md:flex flex-wrap gap-3 p-3 justify-center">
        {tabs.map((tab) => {
          const category = categories.find(cat => cat.slug === tab);
          const displayName = tab === 'all' || tab === 'trending' 
            ? t(`explore.tabs.${tab}`) 
            : (category?.name || tab);
          
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-5 transition-all duration-200 whitespace-nowrap font-medium text-sm ${
                isActive
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-surface text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
              }`}
            >
              {category?.icon && <span className="text-lg">{category.icon}</span>}
              <p>{displayName}</p>
            </button>
          );
        })}
      </div>

      {/* Mobile - Horizontal Scroll with 2 Rows */}
      <div className="md:hidden overflow-x-auto scrollbar-hide p-3">
        <div className="grid grid-flow-col auto-cols-max gap-2" style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
          {tabs.map((tab, index) => {
            const category = categories.find(cat => cat.slug === tab);
            const displayName = tab === 'all' || tab === 'trending' 
              ? t(`explore.tabs.${tab}`) 
              : (category?.name || tab);
            
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-5 transition-all duration-200 whitespace-nowrap font-medium text-sm ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-surface text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
                }`}
                style={{ gridRow: (index % 2) + 1 }}
              >
                {category?.icon && <span className="text-lg">{category.icon}</span>}
                <p>{displayName}</p>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
