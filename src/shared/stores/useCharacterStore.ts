import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, CharacterImage, CreateCharacterData } from '@/core/domain/entities/Character';

interface CharacterStore {
  characters: Character[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createCharacter: (data: CreateCharacterData) => Promise<void>;
  updateCharacter: (id: string, name: string, images: CharacterImage[]) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
  clearError: () => void;
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      isLoading: false,
      error: null,

      createCharacter: async (data: CreateCharacterData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Convert files to base64 for storage
          const imagePromises = data.images.map(async (file, index) => {
            const preview = await fileToBase64(file);
            return {
              id: `${Date.now()}-${index}`,
              url: preview,
              preview,
            };
          });

          const images = await Promise.all(imagePromises);

          const newCharacter: Character = {
            id: `character-${Date.now()}`,
            name: data.name,
            images,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            characters: [...state.characters, newCharacter],
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create character',
          });
          throw error;
        }
      },

      updateCharacter: async (id: string, name: string, images: CharacterImage[]) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            characters: state.characters.map((char) =>
              char.id === id
                ? { ...char, name, images, updatedAt: new Date() }
                : char
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update character',
          });
          throw error;
        }
      },

      deleteCharacter: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            characters: state.characters.filter((char) => char.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to delete character',
          });
          throw error;
        }
      },

      getCharacterById: (id: string) => {
        return get().characters.find((char) => char.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nero-character-storage',
      partialize: (state) => ({
        characters: state.characters,
      }),
    }
  )
);
