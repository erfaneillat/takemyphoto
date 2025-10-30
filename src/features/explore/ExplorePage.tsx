import { useState, useEffect, useRef } from 'react';
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
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [favoritesCache, setFavoritesCache] = useState<Template[] | null>(null);

  const LIMIT = 24;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTemplates(false);
  }, [exploreState.activeTab, exploreState.searchQuery, sortBy]);

  useEffect(() => {
    if (exploreState.page > 1) {
      fetchTemplates(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreState.page]);

  useEffect(() => {
    // Reset pagination when filters/sort change
    setTemplates([]);
    setHasMore(true);
    setFavoritesCache(null);
    // Ensure page is 1 on sort change
    exploreState.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !exploreState.isLoading) {
          exploreState.setPage(exploreState.page + 1);
        }
      },
      { rootMargin: '300px' }
    );
    const current = loadMoreRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, exploreState.isLoading]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTemplates = async (append: boolean) => {
    try {
      exploreState.setIsLoading(true);
      const params: any = {};
      const offset = (exploreState.page - 1) * LIMIT;

      // Favorites: use dedicated endpoint and filter client-side
      if (sortBy === 'favorites') {
        let favs = favoritesCache;
        if (!favs) {
          favs = await templateApi.getUserFavorites();
          setFavoritesCache(favs);
        }

        // Apply category filter locally
        let filtered = favs;
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          filtered = filtered.filter(t => t.category === exploreState.activeTab);
        }
        // Apply search filter locally
        if (exploreState.searchQuery) {
          const q = exploreState.searchQuery.toLowerCase();
          filtered = filtered.filter(t =>
            t.prompt?.toLowerCase().includes(q) ||
            (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
          );
        }

        const chunk = filtered.slice(offset, offset + LIMIT);
        setHasMore(filtered.length > offset + chunk.length);
        setTemplates(prev => (append ? [...prev, ...chunk] : chunk));
        return;
      }

      // Popular: use dedicated endpoint then optionally filter locally
      if (sortBy === 'popular') {
        const popularParams: any = { limit: LIMIT, period: 'all', offset };
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          popularParams.category = exploreState.activeTab;
        }
        let popular = await templateApi.getPopularStyles(popularParams);
        if (exploreState.searchQuery) {
          const q = exploreState.searchQuery.toLowerCase();
          popular = popular.filter(t =>
            t.prompt?.toLowerCase().includes(q) ||
            (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
          );
        }
        popular = popular.map(t => ({ ...t, isFavorite: !!(t as any).isFavorite }));
        setHasMore(popular.length === LIMIT);
        setTemplates(prev => (append ? [...prev, ...popular] : popular));
        return;
      }

      // Default/trending/category/search via /templates with pagination
      if (exploreState.activeTab === 'trending' || sortBy === 'trending') {
        params.trending = true;
        params.trendingPeriod = 'week'; // Dynamic trending based on last week's activity
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          params.category = exploreState.activeTab; // Category-scoped trending
        }
      } else if (exploreState.activeTab !== 'all') {
        params.category = exploreState.activeTab;
      }

      if (exploreState.searchQuery && !(params.trending === true)) {
        params.search = exploreState.searchQuery;
      }

      params.limit = LIMIT;
      params.offset = offset;

      let data = await templateApi.getTemplates(params);

      // Client-side sorting for newest/oldest when needed
      if (sortBy === 'oldest') {
        data = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortBy === 'newest') {
        data = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setHasMore(data.length === LIMIT);
      setTemplates(prev => (append ? [...prev, ...data] : data));
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
      await fetchTemplates(false);
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
              onSearch={() => fetchTemplates(false)}
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
              {exploreState.isLoading && templates.length === 0 ? (
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
                  <div ref={loadMoreRef} className="h-1 w-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
