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
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800 backdrop-blur-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md z-10"
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
