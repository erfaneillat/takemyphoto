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
      className={`group relative w-full bg-white dark:bg-surface-card rounded-3xl border border-gray-200 dark:border-gray-800 transition-all duration-300 text-left overflow-hidden flex flex-col h-full
        ${tool.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:-translate-y-1'}`}
    >
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
        <img
          src={tool.image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        {(tool.badge || tool.badgeKey) && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-3 py-1 text-xs font-semibold text-white bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
              {tool.badgeKey ? t(`tools.${tool.badgeKey}`) : tool.badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative">
        {/* Gradient Border Top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.color}`} />

        <div className="flex items-start gap-4 mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tool.color} shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300`}>
            {title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {tool.disabled ? t('tools.comingSoon') : t('common.tryNow')}
          </span>
          {!tool.disabled && (
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
              <ArrowRight
                size={16}
                className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-0.5 transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
