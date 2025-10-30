import { RectangleHorizontal } from 'lucide-react';

export type AspectRatioValue = '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';

interface AspectRatioOption {
  value: AspectRatioValue;
  label: string;
  description: string;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { value: '1:1', label: 'Square (1:1)', description: 'Perfect for social media posts' },
  { value: '9:16', label: 'Portrait (9:16)', description: 'Instagram Stories, TikTok' },
  { value: '16:9', label: 'Landscape (16:9)', description: 'YouTube, presentations' },
  { value: '3:4', label: 'Portrait (3:4)', description: 'Standard portrait' },
  { value: '4:3', label: 'Landscape (4:3)', description: 'Classic displays' },
  { value: '3:2', label: 'Classic (3:2)', description: 'Photo prints' },
  { value: '2:3', label: 'Classic Portrait (2:3)', description: 'Portrait prints' },
];

interface AspectRatioSelectorProps {
  value: AspectRatioValue;
  onChange: (value: AspectRatioValue) => void;
  className?: string;
}

export const AspectRatioSelector = ({ value, onChange, className = '' }: AspectRatioSelectorProps) => {
  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <RectangleHorizontal size={16} />
        <span>Aspect Ratio</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AspectRatioValue)}
        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white focus:outline-none text-sm appearance-none cursor-pointer"
      >
        {aspectRatioOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>
    </div>
  );
};
