import { useState } from 'react';
import { useTranslation } from '@/shared/hooks';
import { Button } from '@/shared/components';
import { Trash2, User as UserIcon, Edit } from 'lucide-react';
import { useCharacterStore } from '@/shared/stores';
import type { Character } from '@/core/domain/entities/Character';

interface CharacterListProps {
  onCreateClick: () => void;
  onEditClick: (character: Character) => void;
}

export const CharacterList = ({ onCreateClick, onEditClick }: CharacterListProps) => {
  const { t } = useTranslation();
  const { characters, deleteCharacter } = useCharacterStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('profile.characters.deleteConfirm'))) {
      setDeletingId(id);
      try {
        await deleteCharacter(id);
      } catch (error) {
        console.error('Failed to delete character:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-surface rounded-2xl px-4">
        <UserIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('profile.characters.noCharacters')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          {t('profile.characters.noCharactersDescription')}
        </p>
        <Button
          onClick={onCreateClick}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          {t('profile.characters.createCharacter')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('profile.characters.title')}
        </h2>
        <Button
          onClick={onCreateClick}
          size="sm"
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          {t('profile.characters.createCharacter')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onDelete={handleDelete}
            onEdit={onEditClick}
            isDeleting={deletingId === character.id}
          />
        ))}
      </div>
    </div>
  );
};

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
  onEdit: (character: Character) => void;
  isDeleting: boolean;
}

const CharacterCard = ({ character, onDelete, onEdit, isDeleting }: CharacterCardProps) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  return (
    <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Images Grid */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50 dark:bg-surface">
        {character.images.slice(0, 3).map((img, index) => (
          <div key={img.id} className="relative aspect-square">
            {!imageError[img.id] ? (
              <img
                src={img.url}
                alt={`${character.name} ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError({ ...imageError, [img.id]: true })}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-surface-elevated rounded-lg flex items-center justify-center">
                <UserIcon size={20} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {character.images.length > 3 && (
          <div className="absolute bottom-2 right-2 bg-black/80 dark:bg-black/90 text-white text-xs px-2 py-1 rounded">
            +{character.images.length - 3}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
              {character.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {character.images.length} {t('profile.characters.imageCount')}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(character)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              title={t('profile.characters.editCharacter')}
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(character.id)}
              disabled={isDeleting}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
              title={t('profile.characters.deleteCharacter')}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {new Date(character.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
