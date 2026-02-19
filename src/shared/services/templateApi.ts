import apiClient from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Template {
  id: string;
  imageUrl: string;
  publicId: string;
  prompt: string;
  style?: string;
  category: string;
  tags: string[];
  isTrending: boolean;
  isFavorite: boolean;
  viewCount: number;
  likeCount: number;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetTemplatesParams {
  category?: string;
  search?: string;
  trending?: boolean;
  trendingPeriod?: 'week' | 'month';
  limit?: number;
  offset?: number;
}

export interface GetPopularStylesParams {
  limit?: number;
  period?: 'all' | 'month' | 'week';
  offset?: number;
  category?: string;
}

export const templateApi = {
  // Get all templates with filters
  getTemplates: async (params?: GetTemplatesParams) => {
    const response = await apiClient.get<{ status: string; data: { templates: Template[] } }>('/templates', { params });
    return response.data.data.templates;
  },

  // Get popular styles
  getPopularStyles: async (params?: GetPopularStylesParams) => {
    const response = await apiClient.get<{ status: string; data: { templates: Template[] } }>(
      '/templates/popular',
      { params }
    );
    return response.data.data.templates;
  },

  // Get template by ID
  getTemplateById: async (id: string) => {
    const response = await apiClient.get<{ status: string; data: { template: Template } }>(`/templates/${id}`);
    return response.data.data.template;
  },

  // Toggle favorite template
  toggleFavorite: async (templateId: string) => {
    const response = await apiClient.post<{ status: string; data: { isFavorite: boolean } }>(`/templates/${templateId}/favorite`);
    return response.data.data;
  },

  // Get user's favorite templates
  getUserFavorites: async () => {
    const response = await apiClient.get<{ status: string; data: { templates: Template[] } }>('/templates/favorites');
    return response.data.data.templates;
  },
};

export const categoryApi = {
  // Get all categories
  getCategories: async (isActive?: boolean) => {
    const params = isActive !== undefined ? { isActive } : undefined;
    const response = await apiClient.get<{ status: string; data: { categories: Category[] } }>('/categories', { params });
    return response.data.data.categories;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string) => {
    const categories = await categoryApi.getCategories(true);
    return categories.find(cat => cat.slug === slug);
  },
};

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  types: string[];
  sampleImages: { url: string; publicId: string }[];
  order: number;
  isActive: boolean;
}

export const shopCategoryApi = {
  // Get shop categories, optionally filtered by shop types
  getShopCategories: async (types?: string[]) => {
    const params: Record<string, string> = { isActive: 'true' };
    if (types && types.length > 0) {
      params.types = types.join(',');
    }
    const response = await apiClient.get<{ status: string; data: { categories: ShopCategory[] } }>('/shop-categories', { params });
    return response.data.data.categories;
  },
};
