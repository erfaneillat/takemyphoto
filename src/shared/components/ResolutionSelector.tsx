import { Monitor } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

export type ResolutionValue = '1K' | '2K' | '4K';

interface ResolutionOption {
    value: ResolutionValue;
    labelKey: string;
    descriptionKey: string;
}

const resolutionOptions: ResolutionOption[] = [
    { value: '1K', labelKey: 'generate.resolution.options.1K.label', descriptionKey: 'generate.resolution.options.1K.description' },
    { value: '2K', labelKey: 'generate.resolution.options.2K.label', descriptionKey: 'generate.resolution.options.2K.description' },
    { value: '4K', labelKey: 'generate.resolution.options.4K.label', descriptionKey: 'generate.resolution.options.4K.description' },
];

// Helper function to get star cost for a resolution
export function getStarCostForResolution(resolution: ResolutionValue): number {
    return resolution === '4K' ? 20 : 10;
}

interface ResolutionSelectorProps {
    value: ResolutionValue;
    onChange: (value: ResolutionValue) => void;
    className?: string;
}

export const ResolutionSelector = ({ value, onChange, className = '' }: ResolutionSelectorProps) => {
    const { t } = useTranslation();
    return (
        <div className={className}>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Monitor size={16} />
                <span>{t('generate.resolution.label')}</span>
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as ResolutionValue)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white focus:outline-none text-sm appearance-none cursor-pointer"
            >
                {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.labelKey)} - {t(option.descriptionKey)}
                    </option>
                ))}
            </select>
        </div>
    );
};
