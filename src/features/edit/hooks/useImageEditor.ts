import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type {
  GeneratedImage,
  UploadedImage,
  EditMode,
  ImageGenerationParams,
  ImageEditParams
} from '@/core/domain/entities/Image';
import { nanoBananaApi } from '@/shared/services';
import { useAuthStore } from '@/shared/stores';
import { handleInsufficientStarsError, getErrorMessage } from '@/shared/utils';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';
import type { ResolutionValue } from '@/shared/components/ResolutionSelector';

export const useImageEditor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUser } = useAuthStore();
  const [mode, setMode] = useState<EditMode>('generate');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
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

  const generateImage = useCallback(async (params: ImageGenerationParams & { templateId?: string, characterImageUrls?: string[] }) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate that we have either uploaded images or character images
      const hasUploadedImages = uploadedImages.length > 0;
      const hasCharacterImages = params.characterImageUrls && params.characterImageUrls.length > 0;

      if (!hasUploadedImages && !hasCharacterImages) {
        throw new Error('Please upload images or select a character');
      }

      // Resolve character image URLs to absolute using server origin (without /api path)
      const serverOrigin = (() => {
        const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
        if (!raw) return '';
        try { const u = new URL(raw); return `${u.protocol}//${u.host}`; } catch { return ''; }
      })();
      const resolvedCharacterUrls = (params.characterImageUrls || []).map(u =>
        u.startsWith('http') ? u : `${serverOrigin}${u}`
      );

      // If no uploaded images, use text-to-image generate endpoint with characterImageUrls
      const response = hasUploadedImages
        ? await nanoBananaApi.editImage({
          prompt: params.prompt,
          numImages: 1,
          imageSize: aspectRatio,
          resolution: resolution,
          images: uploadedImages.map(img => img.file),
          characterImageUrls: resolvedCharacterUrls.length > 0 ? resolvedCharacterUrls : undefined,
          templateId: params.templateId,
        })
        : await nanoBananaApi.generateImage({
          prompt: params.prompt,
          numImages: 1,
          imageSize: aspectRatio,
          resolution: resolution,
          characterImageUrls: resolvedCharacterUrls.length > 0 ? resolvedCharacterUrls : undefined,
          templateId: params.templateId,
        });

      // Resolve returned image URL to absolute path
      const resolvedUrl = response.imageUrl.startsWith('http')
        ? response.imageUrl
        : `${serverOrigin}${response.imageUrl}`;

      // Immediate response: add single edited image to history
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
      console.error('Edit error:', err);

      // Check for insufficient stars error and handle redirect
      if (!handleInsufficientStarsError(err, setError, navigate, t)) {
        setError(getErrorMessage(err) || t('edit.error.failed'));
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, aspectRatio, resolution, navigate, refreshUser, t]);

  const editImages = useCallback(async (params: ImageEditParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await nanoBananaApi.editImage({
        prompt: params.prompt,
        numImages: 1,
        imageSize: aspectRatio,
        resolution: resolution,
        images: params.images.map(img => img.file),
      });

      // Resolve image URL to absolute path using server origin (without /api path)
      const serverOrigin = (() => {
        const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
        if (!raw) return '';
        try { const u = new URL(raw); return `${u.protocol}//${u.host}`; } catch { return ''; }
      })();

      const resolvedUrl = response.imageUrl.startsWith('http')
        ? response.imageUrl
        : `${serverOrigin}${response.imageUrl}`;

      // Immediate response: add single edited image to history
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
      console.error('Edit error:', err);

      // Check for insufficient stars error and handle redirect
      if (!handleInsufficientStarsError(err, setError, navigate, t)) {
        setError(getErrorMessage(err) || t('edit.error.failed'));
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [navigate, refreshUser, t]);

  const editAgain = useCallback((image: GeneratedImage, newPrompt: string) => {
    const editParams: ImageEditParams = {
      prompt: newPrompt,
      images: [{
        id: image.id,
        file: new File([], 'image.png'),
        preview: image.url,
      }],
    };

    return editImages(editParams);
  }, [editImages]);

  const clearAll = useCallback(() => {
    setUploadedImages([]);
    setGeneratedImages([]);
    setPrompt('');
  }, []);

  return {
    mode,
    setMode,
    uploadedImages,
    setUploadedImages,
    generatedImages,
    isProcessing,
    prompt,
    setPrompt,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    addUploadedImage,
    removeUploadedImage,
    generateImage,
    editImages,
    editAgain,
    clearAll,
    error,
  };
};
