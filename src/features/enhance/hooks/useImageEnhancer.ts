import { useState } from 'react';
import { enhanceApi } from '@/shared/services/enhanceApi';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export interface UpscaledResult {
  url: string;
  width: number;
  height: number;
  scale: number;
}

export const useImageUpscaler = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [upscaledResult, setUpscaledResult] = useState<UpscaledResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [showResultModal, setShowResultModal] = useState(false);

  const addUploadedImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage({
        id: Date.now().toString(),
        file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setError(null);
    setUpscaledResult(null);
    setShowResultModal(false);
  };

  const upscaleImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Resolve server origin for static uploads
      const apiOrigin = (import.meta as any).env.VITE_SERVER_ORIGIN || window.location.origin;

      // Call backend API to upscale image
      const result = await enhanceApi.upscaleImage(uploadedImage.file, scale);
      
      // Construct URL: in dev use relative (/uploads -> Vite proxy), in prod use absolute
      const fullUrl = (import.meta as any).env.DEV
        ? result.url
        : (result.url.startsWith('http') ? result.url : `${apiOrigin}${result.url}`);

      const upscaled: UpscaledResult = {
        url: fullUrl,
        width: result.width,
        height: result.height,
        scale,
      };

      setUpscaledResult(upscaled);
      setShowResultModal(true);
    } catch (err: any) {
      console.error('Upscaling failed:', err);
      const serverMsg = err?.response?.data?.message;
      const msg = serverMsg || err?.message || 'Upscaling failed';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setUpscaledResult(null);
    setScale(2);
    setShowResultModal(false);
  };

  return {
    uploadedImage,
    upscaledResult,
    isProcessing,
    error,
    scale,
    showResultModal,
    setScale,
    setShowResultModal,
    addUploadedImage,
    removeUploadedImage,
    upscaleImage,
    reset,
  };
};
