import { useRef, useState } from 'react';
import { useTranslation } from '@/shared/hooks';
import { InlineBrushCanvas } from './components/InlineBrushCanvas';
import { nanoBananaApi } from '@/shared/services/nanoBananaApi';
import { ResolutionSelector } from '@/shared/components/ResolutionSelector';
import type { ResolutionValue } from '@/shared/components/ResolutionSelector';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Loader2,
  X,
  Download,
  Plus,
} from 'lucide-react';

export const BrushEditPage = () => {
  const { t } = useTranslation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<ResolutionValue>('1K');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine what to display in main preview
  const mainDisplayImage = selectedHistoryImage || (generatedImages.length > 0 ? generatedImages[0] : null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setMaskDataUrl(null);
      setGeneratedImages([]);
      setSelectedHistoryImage(null);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Convert data URL to File object
   */
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  /**
   * Create composite image (original + mask overlay)
   */
  const createCompositeImage = async (originalDataUrl: string, maskDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const originalImg = new Image();
      originalImg.crossOrigin = 'anonymous';

      originalImg.onload = () => {
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;

        // Draw original image
        ctx.drawImage(originalImg, 0, 0);

        // Draw mask overlay
        const maskImg = new Image();
        maskImg.crossOrigin = 'anonymous';

        maskImg.onload = () => {
          // Draw mask with semi-transparency to show the brushed areas
          ctx.globalAlpha = 0.5;
          ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;

          // Convert to data URL
          resolve(canvas.toDataURL('image/png'));
        };

        maskImg.onerror = () => reject(new Error('Failed to load mask image'));
        maskImg.src = maskDataUrl;
      };

      originalImg.onerror = () => reject(new Error('Failed to load original image'));
      originalImg.src = originalDataUrl;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !uploadedImage) return;

    // Check if user has drawn any mask
    if (!maskDataUrl) {
      setError('Please draw on the image to indicate which areas you want to edit');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create composite image (original + red mask overlay)
      const compositeDataUrl = await createCompositeImage(uploadedImage, maskDataUrl);

      // Convert to File
      const compositeFile = dataURLtoFile(compositeDataUrl, 'brushed-image.png');

      // Call API with the composite image
      const result = await nanoBananaApi.editImage({
        prompt: prompt.trim(),
        images: [compositeFile],
        numImages: 1,
        resolution: resolution,
      });

      // Add generated image to history
      const generatedImageUrl = result.imageUrl.startsWith('http')
        ? result.imageUrl
        : `${import.meta.env.VITE_API_BASE_URL || ''}${result.imageUrl}`;

      setGeneratedImages(prev => [...prev, generatedImageUrl]);
      setSelectedHistoryImage(generatedImageUrl);
      // Set the generated image as the new uploaded image for next edit
      setUploadedImage(generatedImageUrl);
      setMaskDataUrl(null);
      setPrompt('');
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setMaskDataUrl(null);
    setGeneratedImages([]);
    setSelectedHistoryImage(null);
    setPrompt('');
  };

  return (
    <div className="h-full bg-white dark:bg-black flex flex-col overflow-hidden transition-colors">
      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        {/* Image Preview & Canvas Panel */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-surface min-h-0">
          <div className="flex-1 min-h-[300px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
            {uploadedImage || mainDisplayImage ? (
              <div className="w-full h-full relative">
                <InlineBrushCanvas
                  imageUrl={mainDisplayImage || uploadedImage!}
                  onMaskChange={setMaskDataUrl}
                  overlay={mainDisplayImage ? (
                    <div className="flex gap-2">
                      {/* Download Button */}
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = mainDisplayImage;
                          link.download = `edited-image-${Date.now()}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 md:p-3 shadow-lg transition-all active:scale-95"
                        title="Download image"
                      >
                        <Download size={20} className="md:w-6 md:h-6" />
                      </button>
                      {/* Attach as Reference Button */}
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(mainDisplayImage);
                            const blob = await response.blob();
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUploadedImage(reader.result as string);
                              setMaskDataUrl(null);
                            };
                            reader.readAsDataURL(blob);
                          } catch (error) {
                            console.error('Failed to attach image as reference:', error);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 md:p-3 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        title="Use as new reference"
                      >
                        <Plus size={20} className="md:w-6 md:h-6" />
                        <span className="text-xs md:text-sm font-medium hidden sm:inline">
                          {t('generate.attachReference')}
                        </span>
                      </button>
                    </div>
                  ) : undefined}
                />
              </div>
            ) : (
              <div className="text-center p-4 md:p-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3 md:mb-4 md:w-16 md:h-16" />
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium mb-4">
                  {t('edit.brushMode.noImageYet')}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
                >
                  <Upload size={20} />
                  <span>{t('edit.promptBased.uploadImage')}</span>
                </button>
              </div>
            )}
          </div>

          {/* History Carousel - Compact */}
          {generatedImages.length > 0 && (
            <div className="flex-shrink-0 p-2 bg-white dark:bg-surface-card border-t border-gray-200 dark:border-border-light">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 px-2">
                {t('edit.history.title')}
              </h3>
              <div className="flex gap-1.5 overflow-x-auto pb-1 px-2">
                {generatedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedHistoryImage(image)}
                    className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${selectedHistoryImage === image || (!selectedHistoryImage && index === generatedImages.length - 1)
                      ? 'border-blue-500 dark:border-blue-400 shadow-md'
                      : 'border-gray-200 dark:border-border-light hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`History ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-surface-card border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-border-light flex flex-col">
          <div className="p-4 md:p-6 pb-[calc(90px+env(safe-area-inset-bottom))] lg:pb-6 flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {t('edit.brushMode.title')}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t('edit.brushMode.description')}
              </p>
            </div>

            {/* Upload Image Section */}
            {uploadedImage ? (
              <div className="hidden md:block mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uploaded Image
                </label>
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-border-light group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-all flex items-center justify-center"
                  >
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-light hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer"
                >
                  <Upload size={24} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('edit.promptBased.uploadImage')}
                  </span>
                </button>
              </div>
            )}

            {/* Prompt Input */}
            {uploadedImage && (
              <div className="mb-4 md:mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('edit.brushTool.promptPlaceholder')}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none min-h-[100px] md:min-h-[120px] text-sm"
                />
              </div>
            )}

            {/* Resolution Selector */}
            {uploadedImage && (
              <ResolutionSelector
                value={resolution}
                onChange={setResolution}
                className="mb-4 md:mb-6"
              />
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 md:mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Generate Button - Fixed at Bottom on Mobile, Inline on Desktop */}
          {uploadedImage && (
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-border-light bg-white dark:bg-surface-card lg:relative fixed bottom-24 md:bottom-0 left-0 right-0 z-[60] lg:z-auto pb-[env(safe-area-inset-bottom)]">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isProcessing}
                className="w-full px-4 md:px-6 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:hover:shadow-blue-600/30 flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
                    <span className="truncate">{t('edit.editingImage')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="md:w-5 md:h-5" />
                    <span>{t('edit.brushMode.editButton')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
