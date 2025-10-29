import { Search } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export const SearchBar = ({ value, onChange, onSearch }: SearchBarProps) => {
  const { t } = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const isRTL = typeof document !== 'undefined' && document?.dir === 'rtl';
  const iconPositionClass = isRTL ? 'left-4' : 'right-4';
  const inputPaddingClass = isRTL ? 'pl-12 pr-4' : 'pr-12 pl-4';

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full">
      <div className="relative min-w-40 h-14 w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('explore.search') || 'Search for a style...'}
          className={`form-input w-full h-14 rounded-full border border-gray-200 dark:border-border-light bg-white dark:bg-surface text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:outline-0 focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 shadow-sm hover:shadow-md transition-shadow text-base ${inputPaddingClass}`}
        />
        <Search
          size={20}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 ${iconPositionClass}`}
        />
      </div>
    </div>
  );
};
