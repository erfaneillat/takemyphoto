import { ArrowUpDown, Clock, TrendingUp, Heart, Calendar, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { useState, useRef, useEffect } from 'react';

export type SortOption = 'trending' | 'newest' | 'oldest' | 'popular' | 'favorites';

interface SortWidgetProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortWidget = ({ activeSort, onSortChange }: SortWidgetProps) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'trending', label: t('explore.sort.trending') || 'Trending', icon: <TrendingUp size={16} /> },
    { value: 'newest', label: t('explore.sort.newest') || 'Newest', icon: <Calendar size={16} /> },
    { value: 'oldest', label: t('explore.sort.oldest') || 'Oldest', icon: <Clock size={16} /> },
    { value: 'popular', label: t('explore.sort.popular') || 'Popular', icon: <ArrowUpDown size={16} /> },
    { value: 'favorites', label: t('explore.sort.favorites') || 'Favorites', icon: <Heart size={16} /> },
  ];

  const activeOption = sortOptions.find(opt => opt.value === activeSort) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (sort: SortOption) => {
    onSortChange(sort);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3">
      {/* Desktop - Button List */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <ArrowUpDown size={18} />
          <span className="text-sm font-medium">{t('explore.sortBy') || 'Sort by'}:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSort === option.value
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-gray-100 dark:bg-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile - Dropdown */}
      <div className="md:hidden relative w-full max-w-xs" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-100 dark:bg-surface text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-surface-hover transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown size={18} />
            <span>{t('explore.sortBy') || 'Sort by'}:</span>
            <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold">
              {activeOption.icon}
              {activeOption.label}
            </span>
          </div>
          <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-lg shadow-lg overflow-hidden z-50">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeSort === option.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-surface-hover'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
