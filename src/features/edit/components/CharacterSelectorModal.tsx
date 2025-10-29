import { useState } from 'react';
import { X, Upload, User as UserIcon } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { useCharacterStore } from '@/shared/stores';
import type { Character } from '@/core/domain/entities/Character';
import { CharacterForm } from '@/features/profile/components/CharacterForm';

interface CharacterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (character: Character) => void;
  onUploadImage: () => void;
}

export const CharacterSelectorModal = ({
  isOpen,
  onClose,
  onSelectCharacter,
  onUploadImage,
}: CharacterSelectorModalProps) => {
  const { t } = useTranslation();
  const { characters } = useCharacterStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);

  if (!isOpen) return null;

  const handleSelectCharacter = () => {
    const character = characters.find((c) => c.id === selectedCharacterId);
    if (character) {
      onSelectCharacter(character);
      onClose();
    }
  };

  const handleUploadClick = () => {
    onUploadImage();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-card rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-border-light transition-colors flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border-light">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('edit.characterSelector.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-all"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Option */}
          <div className="mb-6">
            <button
              onClick={handleUploadClick}
              className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-border-light hover:border-gray-900 dark:hover:border-white/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-surface-hover"
            >
              <Upload size={32} className="text-gray-600 dark:text-gray-400" />
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {t('edit.characterSelector.uploadImage')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('edit.characterSelector.uploadImageDescription')}
                </p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-border-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-surface-card text-gray-500 dark:text-gray-400">
                {t('edit.characterSelector.orSelectCharacter')}
              </span>
            </div>
          </div>

          {/* Characters Grid */}
          {characters.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-surface rounded-xl">
              <UserIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {t('edit.characterSelector.noCharacters')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('edit.characterSelector.noCharactersDescription')}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateCharacter(true)}
                  className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all text-sm font-semibold"
                >
                  {t('profile.characters.createCharacter')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacterId(character.id)}
                  className={`relative bg-white dark:bg-surface border-2 rounded-xl overflow-hidden transition-all hover:shadow-md ${
                    selectedCharacterId === character.id
                      ? 'border-gray-900 dark:border-white shadow-lg'
                      : 'border-gray-200 dark:border-border-light'
                  }`}
                >
                  {/* Character Image Preview */}
                  <div className="aspect-square bg-gray-100 dark:bg-surface-elevated">
                    {character.images[0] && !imageError[character.images[0].id] ? (
                      <img
                        src={character.images[0].url}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setImageError({ ...imageError, [character.images[0].id]: true })
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Character Info */}
                  <div className="p-3 bg-white dark:bg-surface-card">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {character.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {character.images.length} {t('profile.characters.imageCount')}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCharacterId === character.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white dark:text-black"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-border-light flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-surface-hover text-gray-900 dark:text-white rounded-xl transition-all font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSelectCharacter}
            disabled={!selectedCharacterId}
            className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {t('edit.characterSelector.selectButton')}
          </button>
        </div>
      </div>

      {showCreateCharacter && (
        <CharacterForm
          onClose={() => setShowCreateCharacter(false)}
          onSuccess={() => setShowCreateCharacter(false)}
        />
      )}
    </div>
  );
};
