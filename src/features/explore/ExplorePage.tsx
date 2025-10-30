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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset and fetch when filters change
    setTemplates([]);
    exploreState.setPage(1);
    setHasMore(true);
    fetchTemplates(true);
  }, [exploreState.activeTab, exploreState.searchQuery, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !exploreState.isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, exploreState.isLoading, isLoadingMore, exploreState.page]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTemplates = async (reset = false) => {
    try {
      if (reset) {
        exploreState.setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const currentPage = reset ? 1 : exploreState.page;
      const offset = (currentPage - 1) * PAGE_SIZE;
      const params: any = {
        limit: PAGE_SIZE,
        offset: offset,
      };

      let data: Template[] = [];

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
        // Paginate client-side
        data = favs.slice(offset, offset + PAGE_SIZE);
        setHasMore(offset + PAGE_SIZE < favs.length);
      }
      // Popular: use dedicated endpoint with usage count sorting
      else if (sortBy === 'popular') {
        let popular = await templateApi.getPopularStyles({ limit: PAGE_SIZE * 10, period: 'all' });
        
        // Sort by usage count (viewCount + likeCount)
        popular = popular.sort((a, b) => {
          const usageA = (a.viewCount || 0) + (a.likeCount || 0);
          const usageB = (b.viewCount || 0) + (b.likeCount || 0);
          return usageB - usageA;
        });

        // Apply category filter locally
        if (exploreState.activeTab !== 'all' && exploreState.activeTab !== 'trending') {
          popular = popular.filter(t => t.category === exploreState.activeTab);
        }
        
        // Apply search filter locally
        if (exploreState.searchQuery) {
          const q = exploreState.searchQuery.toLowerCase();
          popular = popular.filter(t =>
            t.prompt?.toLowerCase().includes(q) ||
            (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
          );
        }
        
        // Paginate client-side
        data = popular.slice(offset, offset + PAGE_SIZE);
        setHasMore(offset + PAGE_SIZE < popular.length);
        
        // Ensure isFavorite exists for UI logic
        data = data.map(t => ({ ...t, isFavorite: !!(t as any).isFavorite }));
      }
      // Default/trending/category/search via /templates
      else {
        // Set trending or category filter
        if (exploreState.activeTab === 'trending' || sortBy === 'trending') {
          params.trending = true;
          params.trendingPeriod = 'week';
        } else if (exploreState.activeTab !== 'all') {
          params.category = exploreState.activeTab;
        }

        if (exploreState.searchQuery) {
          params.search = exploreState.searchQuery;
        }

        data = await templateApi.getTemplates(params);

        // Sort by usage count for trending
        if (params.trending) {
          data = [...data].sort((a, b) => {
            const usageA = (a.viewCount || 0) + (a.likeCount || 0);
            const usageB = (b.viewCount || 0) + (b.likeCount || 0);
            return usageB - usageA;
          });
        }
        // Client-side sorting for newest/oldest when needed
        else if (sortBy === 'oldest') {
          data = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortBy === 'newest') {
          data = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setHasMore(data.length === PAGE_SIZE);
      }

      if (reset) {
        setTemplates(data);
      } else {
        setTemplates(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setHasMore(false);
    } finally {
      exploreState.setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || exploreState.isLoading || isLoadingMore) return;
    exploreState.setPage(exploreState.page + 1);
    fetchTemplates(false);
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      await templateApi.toggleFavorite(templateId);
      // Refresh templates to update isFavorite state
      await fetchTemplates(true);
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
                <>
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
                  
                  {/* Infinite Scroll Observer */}
                  {hasMore && (
                    <div ref={observerTarget} className="w-full py-8 flex justify-center">
                      {isLoadingMore && (
                        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 p-4 w-full">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <StyleCardSkeleton key={`loading-${i}`} index={i} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
