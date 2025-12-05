import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { GeneratedImage, ImageGenerationParams, UploadedImage } from '@/core/domain/entities/Image';
import type { Character } from '@/core/domain/entities/Character';
import { nanoBananaApi } from '@/shared/services';
import { useAuthStore } from '@/shared/stores';
import { handleInsufficientStarsError, getErrorMessage } from '@/shared/utils';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';
import type { ResolutionValue } from '@/shared/components/ResolutionSelector';

export const useImageGenerator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUser } = useAuthStore();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
  const [resolution, setResolution] = useState<ResolutionValue>('1K');
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 5;

  const addUploadedImage = useCallback((file: File) => {
    if (uploadedImages.length >= MAX_IMAGES) {
      return { success: false, message: 'Maximum 5 images allowed' };
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
        resolution: resolution,
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

      // Refresh user data to update star count in header
      await refreshUser();

      return newImage;
    } catch (err: any) {
      console.error('Generation error:', err);

      // Check for insufficient stars error and handle redirect
      if (!handleInsufficientStarsError(err, setError, navigate, t)) {
        setError(getErrorMessage(err) || t('generate.error.failed'));
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, selectedCharacters, aspectRatio, resolution, navigate, t]);

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
    resolution,
    setResolution,
    generateImage,
    addUploadedImage,
    removeUploadedImage,
    setUploadedImages,
    clearAll,
    error,
  };
};
