import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  GeneratedImage, 
  UploadedImage, 
  EditMode,
  ImageGenerationParams,
  ImageEditParams 
} from '@/core/domain/entities/Image';
import { nanoBananaApi } from '@/shared/services';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';

export const useImageEditor = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<EditMode>('generate');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
  const [error, setError] = useState<string | null>(null);

  const addUploadedImage = useCallback((file: File) => {
    if (uploadedImages.length >= 3) {
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
            images: uploadedImages.map(img => img.file),
            characterImageUrls: resolvedCharacterUrls.length > 0 ? resolvedCharacterUrls : undefined,
            templateId: params.templateId,
          })
        : await nanoBananaApi.generateImage({
            prompt: params.prompt,
            numImages: 1,
            imageSize: aspectRatio,
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
      return newImage;
    } catch (err: any) {
      console.error('Edit error:', err);
      
      // Check for insufficient stars error
      if (err.message && err.message.includes('INSUFFICIENT_STARS')) {
        setError('You have run out of stars. Redirecting to subscription page...');
        // Navigate to subscription page after showing error
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      } else {
        setError(err.message || 'Failed to edit image');
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, aspectRatio, navigate]);

  const editImages = useCallback(async (params: ImageEditParams) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await nanoBananaApi.editImage({
        prompt: params.prompt,
        numImages: 1,
        imageSize: aspectRatio,
        images: params.images.map(img => img.file),
      });

      // Resolve image URL to absolute path
      const resolvedUrl = response.imageUrl.startsWith('http')
        ? response.imageUrl
        : `${import.meta.env.VITE_API_BASE_URL || ''}${response.imageUrl}`;

      // Immediate response: add single edited image to history
      const newImage: GeneratedImage = {
        id: response.imageId,
        url: resolvedUrl,
        prompt: params.prompt,
        timestamp: new Date(),
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      return newImage;
    } catch (err: any) {
      console.error('Edit error:', err);
      
      // Check for insufficient stars error
      if (err.message && err.message.includes('INSUFFICIENT_STARS')) {
        setError('You have run out of stars. Redirecting to subscription page...');
        // Navigate to subscription page after showing error
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      } else {
        setError(err.message || 'Failed to edit image');
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [navigate]);

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
    addUploadedImage,
    removeUploadedImage,
    generateImage,
    editImages,
    editAgain,
    clearAll,
    error,
  };
};
