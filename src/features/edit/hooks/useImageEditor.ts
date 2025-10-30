import { useState, useCallback } from 'react';
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
      // Call NanoBanana edit API (requires at least one image)
      if (uploadedImages.length === 0) {
        throw new Error('At least one image is required for editing');
      }

      const response = await nanoBananaApi.editImage({
        prompt: params.prompt,
        numImages: 1,
        imageSize: aspectRatio,
        images: uploadedImages.map(img => img.file),
        characterImageUrls: params.characterImageUrls,
        templateId: params.templateId,
      });

      // Resolve image URL to absolute path
      const resolvedUrl = response.imageUrl.startsWith('http')
        ? response.imageUrl
        : `${import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:2000'}${response.imageUrl}`;

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
      setError(err.message || 'Failed to edit image');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, aspectRatio]);

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
        : `${import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:2000'}${response.imageUrl}`;

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
      setError(err.message || 'Failed to edit image');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

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
