import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/shared/hooks';
import { Button } from '@/shared/components';
import { X, Upload, Trash2 } from 'lucide-react';
import { useCharacterStore } from '@/shared/stores';
import type { CreateCharacterData, Character, CharacterImage } from '@/core/domain/entities/Character';

interface CharacterFormProps {
  character?: Character; // If provided, we're in edit mode
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImagePreview {
  file?: File; // Optional for existing images
  preview: string;
  existingImage?: CharacterImage; // For existing images
}

export const CharacterForm = ({ character, onClose, onSuccess }: CharacterFormProps) => {
  const { t } = useTranslation();
  const { createCharacter, updateCharacter, isLoading } = useCharacterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!character;

  const [name, setName] = useState(character?.name || '');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<{ name?: string; images?: string }>({});

  // Pre-populate images when editing
  useEffect(() => {
    if (character) {
      const existingImages: ImagePreview[] = character.images.map((img) => ({
        preview: img.url,
        existingImage: img,
      }));
      setImages(existingImages);
    }
  }, [character]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      setErrors({ ...errors, images: t('profile.characters.validation.maxImagesExceeded') });
      return;
    }

    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newPreviews]);
    setErrors({ ...errors, images: undefined });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (images.length + files.length > 5) {
      setErrors({ ...errors, images: t('profile.characters.validation.maxImagesExceeded') });
      return;
    }

    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newPreviews]);
    setErrors({ ...errors, images: undefined });
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Only revoke URL for new uploads, not existing images
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; images?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('profile.characters.validation.nameRequired');
    }

    if (images.length < 3) {
      newErrors.images = t('profile.characters.validation.minImagesRequired');
    }
    if (images.length > 5) {
      newErrors.images = t('profile.characters.validation.maxImagesExceeded');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditMode && character) {
        const newFiles = images.filter(img => img.file).map(img => img.file!);
        const existingImages = images.filter(img => img.existingImage).map(img => img.existingImage!);
        await updateCharacter(character.id, name.trim(), existingImages, newFiles);
      } else {
        // Create mode
        const data: CreateCharacterData = {
          name: name.trim(),
          images: images.filter(img => img.file).map((img) => img.file!),
        };
        await createCharacter(data);
      }
      
      // Clean up previews for new uploads
      images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.preview);
        }
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-border-light transition-colors max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-surface-card border-b border-gray-200 dark:border-border-light p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t('profile.characters.editCharacter') : t('profile.characters.createCharacter')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-all"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.characters.characterName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.characters.characterNamePlaceholder')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-surface border ${
                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-border-light'
              } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.characters.uploadImages')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t('profile.characters.uploadImagesHint')}
            </p>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${
                errors.images ? 'border-red-500' : 'border-gray-300 dark:border-border-light'
              } rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-surface transition-colors`}
            >
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.characters.dragDropImages')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {images.length}/5 {t('profile.characters.imageCount')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {errors.images && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 dark:border-border-light"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-border-light">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
