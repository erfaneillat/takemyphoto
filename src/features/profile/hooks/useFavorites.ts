import { useState, useEffect } from 'react';
import { templateApi, Template } from '@/shared/services/templateApi';

export const useFavorites = () => {
  const [favoriteTemplates, setFavoriteTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const templates = await templateApi.getUserFavorites();
      setFavoriteTemplates(templates);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
      setFavoriteTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleFavorite = async (templateId: string) => {
    try {
      await templateApi.toggleFavorite(templateId);
      // Refresh favorites list after toggle
      await fetchFavorites();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite');
    }
  };

  const removeFavorite = async (templateId: string) => {
    try {
      await templateApi.toggleFavorite(templateId);
      // Remove from local state immediately for better UX
      setFavoriteTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite');
      // Refresh to restore state if remove failed
      await fetchFavorites();
    }
  };

  return {
    favoriteTemplates,
    isLoading,
    error,
    toggleFavorite,
    removeFavorite,
    refetch: fetchFavorites,
  };
};
