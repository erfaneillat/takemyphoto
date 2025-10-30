import { Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Template } from '@/shared/services/templateApi';

interface StyleCardProps {
  template: Template;
  onToggleFavorite?: (templateId: string) => void;
  onStyleClick?: (template: Template) => void;
  index?: number;
}

export const StyleCard = ({ 
  template, 
  onToggleFavorite,
  onStyleClick,
  index = 0
}: StyleCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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

  // Create varying aspect ratios for masonry effect
  const getAspectRatio = () => {
    const patterns = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[3/5]'];
    return patterns[index % patterns.length];
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer mb-4 break-inside-avoid"
    >
      {/* Image Container - Variable aspect ratios */}
      <div ref={imgRef} className={`relative w-full ${getAspectRatio()} overflow-hidden bg-gray-900 dark:bg-gray-900`}>
        {isVisible && (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-surface-hover dark:via-gray-700 dark:to-surface-hover animate-shimmer bg-[length:200%_100%]"></div>
            )}
            <img
              src={template.imageUrl}
              alt={template.prompt}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              crossOrigin="anonymous"
            />
          </>
        )}
        
        {/* Hover Overlay with Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-semibold truncate">{template.prompt || template.style || 'Style'}</p>
            {template.usageCount !== undefined && template.usageCount > 0 && (
              <p className="text-white/80 text-xs mt-1">{template.usageCount} uses</p>
            )}
          </div>
        </div>

        {/* Usage Count Badge */}
        {template.usageCount !== undefined && template.usageCount > 0 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {template.usageCount}
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md z-10"
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
