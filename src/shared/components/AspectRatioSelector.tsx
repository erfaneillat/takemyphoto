import { RectangleHorizontal } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

export type AspectRatioValue = '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';

interface AspectRatioOption {
  value: AspectRatioValue;
  labelKey: string;
  descriptionKey: string;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { value: '1:1', labelKey: 'generate.aspectRatio.options.1_1.label', descriptionKey: 'generate.aspectRatio.options.1_1.description' },
  { value: '9:16', labelKey: 'generate.aspectRatio.options.9_16.label', descriptionKey: 'generate.aspectRatio.options.9_16.description' },
  { value: '16:9', labelKey: 'generate.aspectRatio.options.16_9.label', descriptionKey: 'generate.aspectRatio.options.16_9.description' },
  { value: '3:4', labelKey: 'generate.aspectRatio.options.3_4.label', descriptionKey: 'generate.aspectRatio.options.3_4.description' },
  { value: '4:3', labelKey: 'generate.aspectRatio.options.4_3.label', descriptionKey: 'generate.aspectRatio.options.4_3.description' },
  { value: '3:2', labelKey: 'generate.aspectRatio.options.3_2.label', descriptionKey: 'generate.aspectRatio.options.3_2.description' },
  { value: '2:3', labelKey: 'generate.aspectRatio.options.2_3.label', descriptionKey: 'generate.aspectRatio.options.2_3.description' },
];

interface AspectRatioSelectorProps {
  value: AspectRatioValue;
  onChange: (value: AspectRatioValue) => void;
  className?: string;
}

export const AspectRatioSelector = ({ value, onChange, className = '' }: AspectRatioSelectorProps) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <RectangleHorizontal size={16} />
        <span>{t('generate.aspectRatio.label')}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AspectRatioValue)}
        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white focus:outline-none text-sm appearance-none cursor-pointer"
      >
        {aspectRatioOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)} - {t(option.descriptionKey)}
          </option>
        ))}
      </select>
    </div>
  );
};
