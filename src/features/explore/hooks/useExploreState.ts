import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ExploreState {
  activeTab: string;
  searchQuery: string;
  sortBy: string;
  isLoading: boolean;
  page: number;
}

export const useExploreState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoadingState] = useState(false);
  const [page, setPageState] = useState(1);

  const activeTab = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'trending';

  const setActiveTab = useCallback((tab: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (tab === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', tab);
      }
      return newParams;
    });
    setPageState(1);
  }, [setSearchParams]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (query === '') {
        newParams.delete('search');
      } else {
        newParams.set('search', query);
      }
      return newParams;
    });
    setPageState(1);
  }, [setSearchParams]);

  const setSortBy = useCallback((sort: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (sort === 'trending') {
        newParams.delete('sort');
      } else {
        newParams.set('sort', sort);
      }
      return newParams;
    });
    setPageState(1);
  }, [setSearchParams]);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const reset = useCallback(() => {
    setSearchParams({});
    setIsLoadingState(false);
    setPageState(1);
  }, [setSearchParams]);

  return {
    activeTab,
    searchQuery,
    sortBy,
    isLoading,
    page,
    setActiveTab,
    setSearchQuery,
    setSortBy,
    setIsLoading,
    setPage,
    reset,
  };
};
