import { useState } from 'react';
import { Download } from 'lucide-react';

interface ImageCardProps {
  imageUrl: string;
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const ImageCard = ({ imageUrl, title, buttonText, onButtonClick }: ImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full aspect-square object-cover"
      />

      {/* Download Button on Hover */}
      <button
        onClick={handleDownload}
        className={`absolute bottom-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-lg ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        aria-label="Download image"
        title="Download image"
      >
        <Download size={20} />
      </button>
    </div>
  );
};
