import { create } from 'zustand';
import type { Character, CharacterImage, CreateCharacterData } from '@/core/domain/entities/Character';
import { fetchWithRetry } from '@/shared/hooks';

const resolveApiBase = () => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  // If no env set, use same-origin relative path
  if (!raw) return '/api/v1';
  
  // If page is https but env uses http, upgrade to https to avoid mixed content
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && raw.startsWith('http://')) {
    try {
      const u = new URL(raw);
      u.protocol = 'https:';
      return u.toString();
    } catch {
      // fall through to raw
    }
  }
  return raw;
};

const API_BASE_URL = resolveApiBase();

let fetchCharactersInFlight: Promise<void> | null = null;
let lastFetchAt = 0;
const MIN_FETCH_INTERVAL_MS = 2000;

interface CharacterStore {
  characters: Character[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createCharacter: (data: CreateCharacterData) => Promise<void>;
  updateCharacter: (id: string, name: string, existingImages: CharacterImage[], newFiles: File[]) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
  fetchCharacters: () => Promise<void>;
  clearError: () => void;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  isLoading: false,
  error: null,

  createCharacter: async (data: CreateCharacterData) => {
    set({ isLoading: true, error: null });

    try {
      const formData = new FormData();
      formData.append('name', data.name);

      // Append image files
      data.images.forEach((file) => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Character creation error:', errorText);
        throw new Error(`Failed to create character: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Character created successfully:', responseData);

      const newCharacter = responseData.data?.character;
      if (!newCharacter) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format from server');
      }

      set((state) => ({
        characters: [...state.characters, newCharacter],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  fetchCharacters: async () => {
    const now = Date.now();
    if (now - lastFetchAt < MIN_FETCH_INTERVAL_MS) {
      return;
    }
    if (fetchCharactersInFlight) {
      return fetchCharactersInFlight;
    }

    set({ isLoading: true, error: null });

    const run = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in first.');
        }

        const response = await fetchWithRetry(`${API_BASE_URL}/characters`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }, {
          maxRetries: 3,
          baseDelayMs: 800,
          retryOn: [429, 502, 503, 504],
          jitter: true,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch characters: ${response.statusText}`);
        }

        const data = await response.json();

        set({
          characters: data.data.characters || [],
          isLoading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters';
        set({
          isLoading: false,
          error: errorMessage,
        });
      } finally {
        lastFetchAt = Date.now();
        fetchCharactersInFlight = null;
      }
    };

    fetchCharactersInFlight = run();
    return fetchCharactersInFlight;
  },

  updateCharacter: async (id: string, name: string, existingImages: CharacterImage[], newFiles: File[]) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('existingImages', JSON.stringify(existingImages));
      newFiles.forEach((file) => formData.append('newImages', file));

      const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update character: ${response.statusText}`);
      }

      const updatedCharacter = await response.json();

      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === id ? updatedCharacter.data.character : char
        ),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update character';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  deleteCharacter: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete character: ${response.statusText}`);
      }

      set((state) => ({
        characters: state.characters.filter((char) => char.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete character';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  getCharacterById: (id: string) => {
    return get().characters.find((char) => char.id === id);
  },

  clearError: () => set({ error: null }),
}));
