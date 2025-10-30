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
  SortWidget,
  SortOption,
} from './components';

export const ExplorePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const exploreState = useExploreState();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('trending'); // Default to trending

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [exploreState.activeTab, exploreState.searchQuery, sortBy]);

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

      // Favorites: use dedicated endpoint and filter client-side
      if (sortBy === 'favorites') {
        let favs = await templateApi.getUserFavorites();

        // Apply category filter locally
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          favs = favs.filter(t => t.category === exploreState.activeTab);
        }
        // Apply search filter locally
        if (exploreState.searchQuery) {
          const q = exploreState.searchQuery.toLowerCase();
          favs = favs.filter(t =>
            t.prompt?.toLowerCase().includes(q) ||
            (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
          );
        }
        setTemplates(favs);
        return;
      }

      // Popular: use dedicated endpoint then optionally filter locally
      if (sortBy === 'popular') {
        let popular = await templateApi.getPopularStyles({ limit: 100, period: 'all' });
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          popular = popular.filter(t => t.category === exploreState.activeTab);
        }
        if (exploreState.searchQuery) {
          const q = exploreState.searchQuery.toLowerCase();
          popular = popular.filter(t =>
            t.prompt?.toLowerCase().includes(q) ||
            (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
          );
        }
        // Ensure isFavorite exists for UI logic
        popular = popular.map(t => ({ ...t, isFavorite: !!(t as any).isFavorite }));
        setTemplates(popular);
        return;
      }

      // Default/trending/category/search via /templates
      if (exploreState.activeTab === 'trending' || sortBy === 'trending') {
        params.trending = true;
        params.trendingPeriod = 'week'; // Dynamic trending based on last week's activity
      } else if (exploreState.activeTab !== 'all') {
        params.category = exploreState.activeTab;
      }

      if (exploreState.searchQuery) {
        params.search = exploreState.searchQuery;
      }

      let data = await templateApi.getTemplates(params);

      // Client-side sorting for newest/oldest when needed
      if (sortBy === 'oldest') {
        data = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortBy === 'newest') {
        data = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

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

            {/* Sort Widget */}
            <SortWidget
              activeSort={sortBy}
              onSortChange={setSortBy}
            />

            {/* Featured Styles Section */}
            <div className="mt-10">
              <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight px-4 pb-4 pt-6 text-center">
                {t('explore.featuredStyles') || 'Featured Styles'}
              </h2>

              {/* Gallery Masonry Grid */}
              {exploreState.isLoading ? (
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 p-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <StyleCardSkeleton key={i} index={i} />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('explore.noResults') || 'No results found'}
                  </p>
                </div>
              ) : (
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 p-4">
                  {templates.map((template, index) => (
                    <StyleCard
                      key={template.id}
                      template={template}
                      onToggleFavorite={handleToggleFavorite}
                      onStyleClick={handleStyleClick}
                      index={index}
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
