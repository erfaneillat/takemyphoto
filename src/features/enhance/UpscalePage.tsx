import { useRef } from 'react';
import { useTranslation } from '@/shared/hooks';
import { useImageUpscaler } from './hooks/useImageEnhancer';
import {
  Upload,
  Sparkles,
  Loader2,
  ImageIcon,
  X,
  Maximize2,
  Download,
} from 'lucide-react';

export const UpscalePage = () => {
  const { t } = useTranslation();
  const {
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
  } = useImageUpscaler();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addUploadedImage(file);
  };

  const handleUpscale = async () => {
    if (!uploadedImage) return;
    try {
      await upscaleImage();
    } catch (err) {
      console.error('Upscaling error:', err);
    }
  };

  const handleDownload = () => {
    if (!upscaledResult) return;
    
    const link = document.createElement('a');
    link.href = upscaledResult.url;
    link.download = `upscaled-${scale}x-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scaleOptions = [
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
  ];

  return (
    <div className="h-full bg-white dark:bg-black flex flex-col overflow-hidden transition-colors">
      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        {/* Image Preview Panel */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-surface p-3 md:p-6">
          {/* Main Image Display */}
          <div className="flex-1 min-h-[300px] md:min-h-[400px] flex items-center justify-center rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-border-light">
            {uploadedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={uploadedImage.preview}
                  alt="Preview"
                  className="object-contain max-w-[1024px] max-h-[1024px] w-auto h-auto"
                />
                <button
                  onClick={removeUploadedImage}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center p-6 md:p-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3 md:mb-4 md:w-16 md:h-16" />
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium">
                  {t('upscale.preview.noImage')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
                  {t('upscale.preview.uploadToStart')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-surface-card border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-border-light flex flex-col">
          <div className="p-4 md:p-6 pb-[calc(90px+env(safe-area-inset-bottom))] lg:pb-6 flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {t('upscale.title')}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t('upscale.description')}
              </p>
            </div>

            {/* Upload Section */}
            {!uploadedImage ? (
              <div className="mb-4 md:mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 p-8 md:p-12 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-300 dark:border-border-light bg-gray-50 dark:bg-surface hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer active:scale-95"
                >
                  <Upload size={32} className="md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
                  <div className="text-center">
                    <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                      {t('upscale.uploadImage')}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('upscale.uploadHint')}
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <>
                {/* Scale Selector */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('upscale.scaleLabel')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {scaleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setScale(option.value)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          scale === option.value
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10 shadow-md'
                            : 'border-gray-200 dark:border-border-light bg-gray-50 dark:bg-surface hover:border-gray-300 dark:hover:border-gray-600'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Maximize2 
                          size={24} 
                          className={scale === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} 
                        />
                        <span className={`text-lg font-bold ${
                          scale === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('upscale.scaleHint')}
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upscale Button - Fixed at Bottom on Mobile, Inline on Desktop */}
          {uploadedImage && (
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-border-light bg-white dark:bg-surface-card lg:relative fixed bottom-24 md:bottom-0 left-0 right-0 z-[60] lg:z-auto pb-[env(safe-area-inset-bottom)]">
              <button
                onClick={handleUpscale}
                disabled={isProcessing}
                className="w-full px-4 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg md:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:hover:shadow-blue-600/30 flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
                    <span className="truncate">{t('upscale.upscaling')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="md:w-5 md:h-5" />
                    <span>{t('upscale.upscaleButton')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && upscaledResult && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-border-light">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  {t('upscale.result.title')}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('upscale.result.description', { scale: upscaledResult.scale })} • {upscaledResult.width} × {upscaledResult.height}
                </p>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content - Image */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-surface">
              <div className="flex items-center justify-center">
                <img
                  src={upscaledResult.url}
                  alt="Upscaled result"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-border-light">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download size={20} />
                <span>{t('upscale.downloadButton')}</span>
              </button>
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 md:px-6 py-3 bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all active:scale-95"
              >
                {t('upscale.closeButton')}
              </button>
            </div>
          </div>
        </div>
      )}

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
