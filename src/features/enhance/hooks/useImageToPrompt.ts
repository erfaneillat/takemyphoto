import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { handleInsufficientStarsError, getErrorMessage } from '@/shared/utils';

interface UploadedImage {
  file: File;
  preview: string;
}

interface ImageToPromptResult {
  prompt: string;
  detectedElements: string[];
}

export const useImageToPrompt = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [result, setResult] = useState<ImageToPromptResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUploadedImage = (file: File) => {
    const preview = URL.createObjectURL(file);
    setUploadedImage({ file, preview });
    setResult(null);
    setError(null);
  };

  const removeUploadedImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setResult(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage.file);

      const response = await axios.post(
        '/api/v1/enhance/image-to-prompt',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data.data);
    } catch (err: any) {
      console.error('Image to prompt error:', err);
      // Check for insufficient stars error and handle redirect
      if (handleInsufficientStarsError(err, setError, navigate, t)) {
        // Don't continue - let the redirect happen with the message visible
        return;
      }
      setError(getErrorMessage(err) || t('imageToPrompt.error.failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPrompt = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
    }
  };

  const reset = () => {
    removeUploadedImage();
    setResult(null);
    setError(null);
  };

  return {
    uploadedImage,
    result,
    isProcessing,
    error,
    addUploadedImage,
    removeUploadedImage,
    analyzeImage,
    copyPrompt,
    reset,
  };
};
