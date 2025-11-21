import { useState } from 'react';

export interface Tool {
  id: string;
  translationKey: string;
  icon: string;
  path: string;
  color: string;
  image: string;
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
      image: '/image-generator.jpeg',
      badge: 'Popular'
    },
    {
      id: 'edit',
      translationKey: 'promptEditor',
      icon: 'Wand2',
      path: '/edit',
      color: 'from-purple-500 to-pink-500',
      image: '/prompt-base-edit.jpeg'
    },
    {
      id: 'brush',
      translationKey: 'brushEditor',
      icon: 'Paintbrush',
      path: '/edit?mode=brush',
      color: 'from-green-500 to-emerald-500',
      image: '/brush-editor.jpeg'
    },
    {
      id: 'explore',
      translationKey: 'styleExplorer',
      icon: 'Compass',
      path: '/',
      color: 'from-orange-500 to-red-500',
      image: '/explore.png'
    },
    {
      id: 'upscale',
      translationKey: 'imageUpscaler',
      icon: 'Maximize2',
      path: '/upscale',
      color: 'from-cyan-500 to-blue-500',
      image: '/upscale.jpg'
    },
    {
      id: 'imageToPrompt',
      translationKey: 'imageToPrompt',
      icon: 'Lightbulb',
      path: '/image-to-prompt',
      color: 'from-purple-500 to-pink-500',
      image: '/image-to-prompt.jpg'
    },
    {
      id: 'thumbnailGenerator',
      translationKey: 'thumbnailGenerator',
      icon: 'Video',
      path: '/tools/thumbnail-generator',
      color: 'from-red-500 to-orange-500',
      image: '/thumnail.jpg',
      badge: 'New'
    },
    {
      id: 'instagramCoverGenerator',
      translationKey: 'instagramCoverGenerator',
      icon: 'Smartphone',
      path: '/tools/instagram-cover-generator',
      color: 'from-purple-500 to-pink-500',
      image: '/insta.jpeg',
      badge: 'New'
    }
  ];

  return {
    tools,
    selectedTool,
    setSelectedTool
  };
};
