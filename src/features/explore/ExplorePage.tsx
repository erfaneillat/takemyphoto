import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { templateApi, categoryApi, Template, Category } from '@/shared/services/templateApi';
import { useExploreState } from './hooks';
import {
  SearchBar,
  CategoryFilter,
  StyleCard,
  StyleCardSkeleton,
  ExploreHeader,
} from './components';

export const ExplorePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const exploreState = useExploreState();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [exploreState.activeTab, exploreState.searchQuery]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      exploreState.setIsLoading(true);
      const params: any = {};

      if (exploreState.activeTab === 'trending') {
        params.trending = true;
      } else if (exploreState.activeTab !== 'all') {
        params.category = exploreState.activeTab;
      }

      if (exploreState.searchQuery) {
        params.search = exploreState.searchQuery;
      }

      const data = await templateApi.getTemplates(params);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      exploreState.setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      await templateApi.toggleFavorite(templateId);
      // Refresh templates to update isFavorite state
      await fetchTemplates();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleStyleClick = (template: Template) => {
    navigate('/edit', { state: { selectedStyle: template } });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-black transition-colors">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <ExploreHeader />

            {/* Search Bar */}
            <SearchBar
              value={exploreState.searchQuery}
              onChange={exploreState.setSearchQuery}
              onSearch={fetchTemplates}
            />

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              activeTab={exploreState.activeTab}
              onTabChange={exploreState.setActiveTab}
            />

            {/* Featured Styles Section */}
            <div className="mt-10">
              <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight px-4 pb-4 pt-6 text-center">
                {t('explore.featuredStyles') || 'Featured Styles'}
              </h2>

              {/* Gallery Grid */}
              {exploreState.isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 p-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <StyleCardSkeleton key={i} />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('explore.noResults') || 'No results found'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 p-4">
                  {templates.map((template) => (
                    <StyleCard
                      key={template.id}
                      template={template}
                      onToggleFavorite={handleToggleFavorite}
                      onStyleClick={handleStyleClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
