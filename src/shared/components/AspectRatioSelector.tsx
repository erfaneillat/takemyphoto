import { RectangleHorizontal, Check } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

export type AspectRatioValue = '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9' | '2.39:1';

interface AspectRatioOption {
  value: AspectRatioValue;
  labelKey: string;
  descriptionKey: string;
  /** Width and height used to render the visual preview box (relative units) */
  w: number;
  h: number;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { value: '1:1', labelKey: 'generate.aspectRatio.options.1_1.label', descriptionKey: 'generate.aspectRatio.options.1_1.description', w: 1, h: 1 },
  { value: '9:16', labelKey: 'generate.aspectRatio.options.9_16.label', descriptionKey: 'generate.aspectRatio.options.9_16.description', w: 9, h: 16 },
  { value: '16:9', labelKey: 'generate.aspectRatio.options.16_9.label', descriptionKey: 'generate.aspectRatio.options.16_9.description', w: 16, h: 9 },
  { value: '3:4', labelKey: 'generate.aspectRatio.options.3_4.label', descriptionKey: 'generate.aspectRatio.options.3_4.description', w: 3, h: 4 },
  { value: '4:3', labelKey: 'generate.aspectRatio.options.4_3.label', descriptionKey: 'generate.aspectRatio.options.4_3.description', w: 4, h: 3 },
  { value: '3:2', labelKey: 'generate.aspectRatio.options.3_2.label', descriptionKey: 'generate.aspectRatio.options.3_2.description', w: 3, h: 2 },
  { value: '2:3', labelKey: 'generate.aspectRatio.options.2_3.label', descriptionKey: 'generate.aspectRatio.options.2_3.description', w: 2, h: 3 },
  { value: '2.39:1', labelKey: 'generate.aspectRatio.options.2_39_1.label', descriptionKey: 'generate.aspectRatio.options.2_39_1.description', w: 2.39, h: 1 },
];

/** Compute pixel width/height for the preview box. The longest side = maxPx */
function previewSize(w: number, h: number, maxPx = 36): { width: number; height: number } {
  const scale = maxPx / Math.max(w, h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

interface AspectRatioSelectorProps {
  value: AspectRatioValue;
  onChange: (value: AspectRatioValue) => void;
  className?: string;
}

export const AspectRatioSelector = ({ value, onChange, className = '' }: AspectRatioSelectorProps) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <RectangleHorizontal size={16} />
        <span>{t('generate.aspectRatio.label')}</span>
      </label>

      <div className="grid grid-cols-4 gap-2">
        {aspectRatioOptions.map((option) => {
          const isSelected = value === option.value;
          const { width: pw, height: ph } = previewSize(option.w, option.h, 32);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-hover hover:border-primary/50 dark:hover:border-primary/50 hover:bg-gray-100 dark:hover:bg-surface'
                }
              `}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Visual ratio box */}
              <div
                className={`
                  rounded-sm transition-colors duration-200 flex-shrink-0
                  ${isSelected
                    ? 'bg-primary/30 dark:bg-primary/40 border border-primary/50'
                    : 'bg-gray-300 dark:bg-gray-600 border border-gray-300 dark:border-gray-500'
                  }
                `}
                style={{ width: pw, height: ph }}
              />

              {/* Label */}
              <span className={`text-[11px] font-semibold leading-tight text-center truncate w-full ${isSelected ? 'text-primary dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

