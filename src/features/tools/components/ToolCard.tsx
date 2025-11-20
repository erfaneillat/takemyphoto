import { useNavigate } from 'react-router-dom';
import { ImagePlus, Wand2, Compass, Paintbrush, Maximize2, Lightbulb, ArrowRight, Video, Smartphone } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { Tool } from '../hooks';

interface ToolCardProps {
  tool: Tool;
}

const iconMap = {
  ImagePlus: ImagePlus,
  Wand2: Wand2,
  Paintbrush: Paintbrush,
  Maximize2: Maximize2,
  Compass: Compass,
  Lightbulb: Lightbulb,
  Video: Video,
  Smartphone: Smartphone
};

export const ToolCard = ({ tool }: ToolCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const Icon = iconMap[tool.icon as keyof typeof iconMap];

  const handleClick = () => {
    if (tool.disabled) return;
    navigate(tool.path);
  };

  // Get translated title and description
  const title = t(`tools.${tool.translationKey}.title`);
  const description = t(`tools.${tool.translationKey}.description`);

  return (
    <button
      onClick={handleClick}
      aria-disabled={tool.disabled}
      className={`group relative w-full bg-white dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300 text-left overflow-hidden
        ${tool.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:-translate-y-1'}`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      {/* Badge */}
      {(tool.badge || tool.badgeKey) && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
            {tool.badgeKey ? t(`tools.${tool.badgeKey}`) : tool.badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="relative mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} p-3 transform ${tool.disabled ? '' : 'group-hover:scale-110 group-hover:rotate-3'} transition-transform duration-300`}>
          <Icon className="w-full h-full text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 ${tool.disabled ? '' : 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Arrow Icon */}
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-sm">
          <span>{tool.disabled ? t('tools.comingSoon') : t('common.tryNow')}</span>
          {!tool.disabled && (
            <ArrowRight
              size={16}
              className="transform group-hover:translate-x-2 transition-transform duration-300"
            />
          )}
        </div>
      </div>
    </button>
  );
};
