import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GeneratedImage, ImageGenerationParams, UploadedImage } from '@/core/domain/entities/Image';
import type { Character } from '@/core/domain/entities/Character';
import { nanoBananaApi } from '@/shared/services';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';

export const useImageGenerator = () => {
  const navigate = useNavigate();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 3;

  const addUploadedImage = useCallback((file: File) => {
    if (uploadedImages.length >= MAX_IMAGES) {
      return { success: false, message: 'Maximum 3 images allowed' };
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage: UploadedImage = {
        id: Date.now().toString(),
        file,
        preview: reader.result as string,
      };
      setUploadedImages(prev => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
    
    return { success: true };
  }, [uploadedImages.length]);

  const removeUploadedImage = useCallback((id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const generateImage = useCallback(async (params: ImageGenerationParams) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Resolve server origin from VITE_API_BASE_URL (strip /api path)
      const serverOrigin = (() => {
        const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
        if (!raw) return '';
        try { const u = new URL(raw); return `${u.protocol}//${u.host}`; } catch { return ''; }
      })();

      // Get character image URLs from selected characters and resolve to absolute URLs
      const characterImageUrls = selectedCharacters
        .flatMap(char => char.images.map(img => img.url))
        .slice(0, 2)
        .map(u => (u.startsWith('http') ? u : `${serverOrigin}${u}`));

      // Call API (now synchronous)
      const response = await nanoBananaApi.generateImage({
        prompt: params.prompt,
        numImages: 1,
        imageSize: aspectRatio,
        images: uploadedImages.map(img => img.file),
        characterImageUrls
      });

      // Resolve image URL to absolute path
      const resolvedUrl = response.imageUrl.startsWith('http')
        ? response.imageUrl
        : `${serverOrigin}${response.imageUrl}`;

      // Immediate result: add to history
      const newImage: GeneratedImage = {
        id: response.imageId,
        url: resolvedUrl,
        prompt: params.prompt,
        timestamp: new Date(),
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      return newImage;
    } catch (err: any) {
      console.error('Generation error:', err);
      
      // Check for insufficient stars error
      if (err.message && err.message.includes('INSUFFICIENT_STARS')) {
        setError('You have run out of stars. Redirecting to subscription page...');
        // Navigate to subscription page after showing error
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      } else {
        setError(err.message || 'Failed to generate image');
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, selectedCharacters, aspectRatio, navigate]);

  const clearAll = useCallback(() => {
    setGeneratedImages([]);
    setUploadedImages([]);
    setPrompt('');
    setSelectedCharacters([]);
  }, []);

  return {
    generatedImages,
    uploadedImages,
    isProcessing,
    prompt,
    setPrompt,
    selectedCharacters,
    setSelectedCharacters,
    aspectRatio,
    setAspectRatio,
    generateImage,
    addUploadedImage,
    removeUploadedImage,
    setUploadedImages,
    clearAll,
    error,
  };
};
