import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { useImageEditor } from './hooks/useImageEditor';
import type { GeneratedImage } from '@/core/domain/entities/Image';
import type { Character } from '@/core/domain/entities/Character';
import type { Template } from '@/shared/services/templateApi';
import { CharacterSelectorModal } from './components/CharacterSelectorModal';
import { AspectRatioSelector } from '@/shared/components/AspectRatioSelector';
import { ResolutionSelector, getStarCostForResolution } from '@/shared/components/ResolutionSelector';
import {
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  Loader2,
  Users,
  Plus,
  Download,
  Star,
} from 'lucide-react';

export const EditPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const selectedStyle = location.state?.selectedStyle as Template | undefined;

  const {
    uploadedImages,
    generatedImages,
    isProcessing,
    prompt,
    setPrompt,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    removeUploadedImage,
    generateImage,
    addUploadedImage,
    setUploadedImages,
  } = useImageEditor();

  // Single image preview state removed; we use the uploadedImages list from the hook
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] = useState(false);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<string | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [currentSelectedStyle, setCurrentSelectedStyle] = useState<Template | undefined>(selectedStyle);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateImageInputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // New logic: Allow either 1 character OR 5 images (not both)
  const MAX_IMAGES = 5;
  const MAX_CHARACTERS = 1;

  // Allow adding both characters and images (subject to their own limits)
  const canAddMoreImages = uploadedImages.length < MAX_IMAGES;
  const canAddMoreCharacters = selectedCharacters.length < MAX_CHARACTERS;
  const hasAnyAttachment = uploadedImages.length > 0 || selectedCharacters.length > 0;

  const handleGenerateModeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert FileList to array and process each file
    Array.from(files).forEach((file) => {
      if (uploadedImages.length >= MAX_IMAGES) return; // Stop if we've reached the limit
      // Use hook to add image to the list (keeps previous ones)
      addUploadedImage(file);
    });

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleGenerate = async () => {
    // Allow generation with either a prompt or a selected style
    if (!prompt.trim() && !currentSelectedStyle) return;

    try {
      // Use prompt if available, otherwise use style's prompt
      const finalPrompt = prompt.trim() || currentSelectedStyle?.prompt || 'Generate image';

      // Get character image URLs from selected characters (all images)
      const characterImageUrls = selectedCharacters
        .flatMap(char => char.images.map(img => img.url));

      // Generate/edit the image and get the result
      const newImage = await generateImage({
        prompt: finalPrompt,
        templateId: currentSelectedStyle?.id,
        characterImageUrls: characterImageUrls.length > 0 ? characterImageUrls : undefined
      });
      setPrompt('');

      // Clear current attachments
      setUploadedImages([]);

      // Auto-attach the newly edited image as reference for next edit
      if (newImage) {
        try {
          const response = await fetch(newImage.url);
          const blob = await response.blob();
          const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
          addUploadedImage(file);
        } catch (error) {
          console.error('Failed to auto-attach edited image:', error);
        }
      }

      // Reset selected history image to show the newly generated image
      setSelectedHistoryImage(null);
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  const handleOpenCharacterSelector = () => {
    setIsCharacterSelectorOpen(true);
  };

  const handleSelectCharacter = async (character: Character) => {
    // Toggle selection
    if (selectedCharacters.some(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
      return;
    }
    if (!canAddMoreCharacters) return;
    setSelectedCharacters([...selectedCharacters, character]);
  };

  // Set the main display image (show newest/first image in history)
  const mainDisplayImage = selectedHistoryImage || (generatedImages.length > 0 ? generatedImages[0].url : null);

  return (
    <div className="h-full bg-white dark:bg-black flex flex-col overflow-hidden transition-colors">
      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Image Preview & History Panel */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-surface p-3 md:p-6">
          {/* Main Image Display */}
          <div className="flex-1 min-h-[300px] md:min-h-[400px] flex items-center justify-center mb-3 md:mb-6 rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-border-light relative">
            {mainDisplayImage ? (
              <>
                <img
                  src={mainDisplayImage}
                  alt="Generated"
                  className="max-w-full max-h-full object-contain"
                />
                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-2">
                  {/* Download Button */}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = mainDisplayImage;
                      link.download = `generated-image-${Date.now()}.jpg`;
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
                        // Fetch the image from URL and convert to blob
                        const response = await fetch(mainDisplayImage);
                        const blob = await response.blob();
                        // Create a File from the blob
                        const file = new File([blob], 'generated-image.jpg', { type: 'image/jpeg' });
                        addUploadedImage(file);
                      } catch (error) {
                        console.error('Failed to attach image as reference:', error);
                      }
                    }}
                    disabled={!canAddMoreImages}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full p-2 md:p-3 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    title={canAddMoreImages ? 'Attach as reference' : 'Maximum images reached'}
                  >
                    <Plus size={20} className="md:w-6 md:h-6" />
                    <span className="text-xs md:text-sm font-medium hidden sm:inline">
                      {t('generate.attachReference')}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6 md:p-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3 md:mb-4 md:w-16 md:h-16" />
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium">
                  {t('edit.preview.noImage')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
                  {t('edit.preview.generateToSee')}
                </p>
              </div>
            )}
          </div>

          {/* History Carousel */}
          {generatedImages.length > 0 && (
            <div className="flex-shrink-0 mt-auto">
              <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
                {t('edit.history.title')}
              </h3>
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {generatedImages.map((image: GeneratedImage, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedHistoryImage(image.url)}
                    className={`flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${selectedHistoryImage === image.url || (!selectedHistoryImage && index === 0)
                      ? 'border-blue-500 dark:border-blue-400 shadow-lg'
                      : 'border-gray-200 dark:border-border-light hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                  >
                    <img
                      src={image.url}
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
                {t('edit.promptBased.title')}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {t('edit.promptBased.description')}
              </p>
            </div>

            {/* Selected Style Display */}
            {currentSelectedStyle && (
              <div className="mb-4 md:mb-6">
                <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Style
                </p>
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg md:rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 group">
                  <img
                    src={currentSelectedStyle.imageUrl}
                    alt="Selected style"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setCurrentSelectedStyle(undefined)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-all flex items-center justify-center"
                  >
                    <X size={24} className="md:w-8 md:h-8 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            {!currentSelectedStyle && (
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('edit.promptBased.promptLabel')}
                </label>
                <textarea
                  ref={editTextareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('edit.promptBased.promptPlaceholder')}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-surface rounded-lg md:rounded-xl border border-gray-200 dark:border-border-light focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none min-h-[100px] md:min-h-[120px] text-sm"
                />
              </div>
            )}

            {/* Aspect Ratio Selector */}
            <AspectRatioSelector
              value={aspectRatio}
              onChange={setAspectRatio}
              className="mb-4 md:mb-6"
            />

            {/* Resolution Selector */}
            <ResolutionSelector
              value={resolution}
              onChange={setResolution}
              className="mb-4 md:mb-6"
            />

            {/* References Section */}
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('edit.promptBased.referencesLabel')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 md:mb-3">
                You can add 1 character and up to 5 images
              </p>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {/* Upload Image Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canAddMoreImages}
                  className={`flex flex-col items-center justify-center gap-1.5 md:gap-2 p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-dashed transition-all min-h-[100px] md:min-h-[120px] ${canAddMoreImages
                    ? 'bg-gray-50 dark:bg-surface border-gray-300 dark:border-border-light hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <Upload size={20} className={`md:w-6 md:h-6 ${canAddMoreImages ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  <span className={`text-xs font-medium text-center leading-tight ${canAddMoreImages
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {t('edit.promptBased.uploadImage')} <br />({uploadedImages.length}/{MAX_IMAGES})
                  </span>
                </button>

                {/* Attach Character Button */}
                <button
                  onClick={handleOpenCharacterSelector}
                  disabled={!canAddMoreCharacters}
                  className={`flex flex-col items-center justify-center gap-1.5 md:gap-2 p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-dashed transition-all min-h-[100px] md:min-h-[120px] ${canAddMoreCharacters
                    ? 'bg-gray-50 dark:bg-surface border-gray-300 dark:border-border-light hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <Users size={20} className={`md:w-6 md:h-6 ${canAddMoreCharacters ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  <span className={`text-xs font-medium text-center leading-tight ${canAddMoreCharacters
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {t('edit.promptBased.attachCharacter')}
                  </span>
                </button>
              </div>

              {/* Uploaded Images Preview */}
              {(uploadedImages.length > 0 || selectedCharacters.length > 0) && (
                <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-border-light bg-gray-100 dark:bg-surface group">
                      <img
                        src={image.preview}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeUploadedImage(image.id)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-all flex items-center justify-center"
                      >
                        <X size={20} className="md:w-6 md:h-6 text-white" />
                      </button>
                    </div>
                  ))}
                  {selectedCharacters.map((character) => (
                    <div key={character.id} className="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-border-light bg-gray-100 dark:bg-surface group flex items-center justify-center">
                      {character.images.length > 0 ? (
                        <img
                          src={character.images[0].url}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={32} className="md:w-10 md:h-10 text-gray-400 dark:text-gray-600" />
                      )}
                      {/* Show character name and image count badge */}
                      <div className="absolute bottom-2 left-2 bg-black/80 dark:bg-black/90 text-white text-xs px-2 py-1 rounded">
                        <div className="font-semibold">{character.name}</div>
                        <div className="text-xs opacity-90">{character.images.length} {t('profile.characters.imageCount')}</div>
                      </div>
                      <button
                        onClick={() => setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-all flex items-center justify-center"
                      >
                        <X size={20} className="md:w-6 md:h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button - Desktop */}
            <div className="hidden lg:block mt-auto pt-4 md:pt-6 border-t border-gray-200 dark:border-border-light">
              <button
                onClick={handleGenerate}
                disabled={(!prompt.trim() && !currentSelectedStyle) || isProcessing || !hasAnyAttachment}
                className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:hover:shadow-blue-600/30 flex items-center justify-center gap-2 text-base active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
                    <span className="truncate">{t('edit.generatingImage')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="md:w-5 md:h-5" />
                    <span>{t('edit.promptBased.generateButton')}</span>
                    <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-300 text-sm font-medium">{getStarCostForResolution(resolution)}</span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Generate Button - Fixed above bottom nav on mobile */}
      <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 right-0 lg:hidden p-4 border-t border-gray-200 dark:border-border-light bg-white dark:bg-surface-card z-40">
        <button
          onClick={handleGenerate}
          disabled={(!prompt.trim() && !currentSelectedStyle) || isProcessing || !hasAnyAttachment}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:hover:shadow-blue-600/30 flex items-center justify-center gap-2 text-sm active:scale-95"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="truncate">{t('edit.generatingImage')}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>{t('edit.promptBased.generateButton')}</span>
              <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">{getStarCostForResolution(resolution)}</span>
              </div>
            </>
          )}
        </button>
      </div>


      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGenerateModeImageUpload}
        className="hidden"
      />
      <input
        ref={generateImageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGenerateModeImageUpload}
        className="hidden"
      />

      {/* Character Selector Modal */}
      <CharacterSelectorModal
        isOpen={isCharacterSelectorOpen}
        onClose={() => setIsCharacterSelectorOpen(false)}
        onSelectCharacter={handleSelectCharacter}
      />
    </div>
  );
};
