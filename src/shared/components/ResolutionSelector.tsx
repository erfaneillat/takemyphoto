import { Monitor } from 'lucide-react';

export type ResolutionValue = '1K' | '2K' | '4K';

interface ResolutionOption {
    value: ResolutionValue;
    label: string;
    description: string;
}

const resolutionOptions: ResolutionOption[] = [
    { value: '1K', label: '1K (Standard)', description: 'Fast generation, good quality' },
    { value: '2K', label: '2K (High)', description: 'Recommended, balanced quality' },
    { value: '4K', label: '4K (Ultra)', description: 'Best quality, slower generation' },
];

interface ResolutionSelectorProps {
    value: ResolutionValue;
    onChange: (value: ResolutionValue) => void;
    className?: string;
}

export const ResolutionSelector = ({ value, onChange, className = '' }: ResolutionSelectorProps) => {
    return (
        <div className={className}>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Monitor size={16} />
                <span>Resolution</span>
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as ResolutionValue)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white focus:outline-none text-sm appearance-none cursor-pointer"
            >
                {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                    </option>
                ))}
            </select>
        </div>
    );
};

