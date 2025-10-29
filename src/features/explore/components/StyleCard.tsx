import { Heart } from 'lucide-react';
import { Template } from '@/shared/services/templateApi';

interface StyleCardProps {
  template: Template;
  onToggleFavorite?: (templateId: string) => void;
  onStyleClick?: (template: Template) => void;
}

export const StyleCard = ({ 
  template, 
  onToggleFavorite,
  onStyleClick 
}: StyleCardProps) => {
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      await onToggleFavorite(template.id);
    }
  };

  const handleCardClick = () => {
    if (onStyleClick) {
      onStyleClick(template);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Container - Square on all sizes */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-900 dark:bg-gray-900">
        <img
          src={template.imageUrl}
          alt={template.prompt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
          aria-label={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={`transition-colors ${
              template.isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
