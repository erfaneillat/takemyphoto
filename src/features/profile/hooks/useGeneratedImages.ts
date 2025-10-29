import { useState, useEffect } from 'react';
import { generatedImagesApi, GeneratedImage } from '@/shared/services/generatedImagesApi';

interface UseGeneratedImagesResult {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useGeneratedImages = (initialLimit = 20): UseGeneratedImagesResult => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: initialLimit,
    skip: 0,
    hasMore: false
  });

  const fetchImages = async (skip = 0, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await generatedImagesApi.getUserImages(pagination.limit, skip);
      
      if (append) {
        setImages(prev => [...prev, ...response.data.images]);
      } else {
        setImages(response.data.images);
      }

      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Failed to fetch generated images:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!pagination.hasMore || isLoading) return;
    
    const nextSkip = pagination.skip + pagination.limit;
    await fetchImages(nextSkip, true);
  };

  const refresh = async () => {
    await fetchImages(0, false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return {
    images,
    isLoading,
    error,
    pagination,
    loadMore,
    refresh
  };
};
