import { useState, useCallback } from 'react';

export interface ExploreState {
  activeTab: string;
  searchQuery: string;
  isLoading: boolean;
  page: number;
}

export const useExploreState = () => {
  const [state, setState] = useState<ExploreState>({
    activeTab: 'all',
    searchQuery: '',
    isLoading: false,
    page: 1,
  });

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab, page: 1 }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, page: 1 }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const reset = useCallback(() => {
    setState({
      activeTab: 'all',
      searchQuery: '',
      isLoading: false,
      page: 1,
    });
  }, []);

  return {
    ...state,
    setActiveTab,
    setSearchQuery,
    setIsLoading,
    setPage,
    reset,
  };
};
