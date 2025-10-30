import { useRef } from 'react';
import { useTranslation } from '@/shared/hooks';
import { useImageToPrompt } from './hooks/useImageToPrompt';
import {
  Upload,
  Sparkles,
  Loader2,
  ImageIcon,
  X,
  Lightbulb,
  Copy,
  Check,
  Tag,
} from 'lucide-react';
import { useState } from 'react';

export const ImageToPromptPage = () => {
  const { t } = useTranslation();
  const {
    uploadedImage,
    result,
    isProcessing,
    error,
    addUploadedImage,
    removeUploadedImage,
    analyzeImage,
    copyPrompt,
  } = useImageToPrompt();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addUploadedImage(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    try {
      await analyzeImage();
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  const handleCopy = () => {
    copyPrompt();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  {t('imageToPrompt.preview.noImage')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
                  {t('imageToPrompt.preview.uploadToStart')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-surface-card border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-border-light flex flex-col">
          <div className="p-4 md:p-6 pb-24 lg:pb-6">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {t('imageToPrompt.title')}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t('imageToPrompt.description')}
              </p>
            </div>

            {/* Upload Section */}
            {!uploadedImage ? (
              <div className="mb-4 md:mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 p-8 md:p-12 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-300 dark:border-border-light bg-gray-50 dark:bg-surface hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all cursor-pointer active:scale-95"
                >
                  <Upload size={32} className="md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
                  <div className="text-center">
                    <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                      {t('imageToPrompt.uploadImage')}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('imageToPrompt.uploadHint')}
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <>
                {/* Result Section */}
                {result && (
                  <div className="mb-4 md:mb-6">
                    {/* Generated Prompt */}
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Lightbulb size={16} className="text-purple-500" />
                        {t('imageToPrompt.generatedPrompt')}
                      </label>
                      <div className="relative">
                        <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {result.prompt}
                        </div>
                        <button
                          onClick={handleCopy}
                          className="absolute top-2 right-2 p-2 bg-white dark:bg-surface hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all shadow-sm active:scale-95"
                          title={t('imageToPrompt.copyPrompt')}
                        >
                          {copied ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} className="text-purple-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detected Elements */}
                    {result.detectedElements && result.detectedElements.length > 0 && (
                      <div>
                        <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Tag size={16} className="text-purple-500" />
                          {t('imageToPrompt.detectedElements')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {result.detectedElements.map((element, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800"
                            >
                              {element}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Analyze Button - Fixed at Bottom on Mobile, Inline on Desktop */}
          {uploadedImage && (
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-border-light bg-white dark:bg-surface-card lg:relative fixed bottom-24 md:bottom-0 left-0 right-0 z-[60] lg:z-auto pb-[env(safe-area-inset-bottom)]">
              <button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="w-full px-4 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg md:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 disabled:hover:shadow-purple-600/30 flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
                    <span className="truncate">{t('imageToPrompt.analyzing')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="md:w-5 md:h-5" />
                    <span>{t('imageToPrompt.analyzeButton')}</span>
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
