import { useState } from 'react';

export interface Tool {
  id: string;
  translationKey: string;
  icon: string;
  path: string;
  color: string;
  badge?: string;
  badgeKey?: string;
  disabled?: boolean;
}

export const useToolsState = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: 'generate',
      translationKey: 'imageGenerator',
      icon: 'ImagePlus',
      path: '/generate',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Popular'
    },
    {
      id: 'edit',
      translationKey: 'promptEditor',
      icon: 'Wand2',
      path: '/edit',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'brush',
      translationKey: 'brushEditor',
      icon: 'Paintbrush',
      path: '/edit?mode=brush',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'explore',
      translationKey: 'styleExplorer',
      icon: 'Compass',
      path: '/',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'upscale',
      translationKey: 'imageUpscaler',
      icon: 'Maximize2',
      path: '/upscale',
      color: 'from-cyan-500 to-blue-500',
      badgeKey: 'comingSoon',
      disabled: true
    },
    {
      id: 'imageToPrompt',
      translationKey: 'imageToPrompt',
      icon: 'Lightbulb',
      path: '/image-to-prompt',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'thumbnailGenerator',
      translationKey: 'thumbnailGenerator',
      icon: 'Video',
      path: '/tools/thumbnail-generator',
      color: 'from-red-500 to-orange-500',
      badge: 'New'
    },
    {
      id: 'instagramCoverGenerator',
      translationKey: 'instagramCoverGenerator',
      icon: 'Smartphone', // Changed to something mobile-related or just use Image/Instagram-like icon if available. 'Instagram' might be in lucide-react as a logo, but let's stick to generic icons. 'Smartphone' or 'LayoutTemplate' or 'Grid'
      path: '/tools/instagram-cover-generator',
      color: 'from-purple-500 to-pink-500',
      badge: 'New'
    }
  ];

  return {
    tools,
    selectedTool,
    setSelectedTool
  };
};
