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
  createdAt: string;
  updatedAt: string;
}

export interface GetTemplatesParams {
  category?: string;
  search?: string;
  trending?: boolean;
  limit?: number;
  offset?: number;
}

export const templateApi = {
  // Get all templates with filters
  getTemplates: async (params?: GetTemplatesParams) => {
    const response = await apiClient.get<{ status: string; data: { templates: Template[] } }>('/templates', { params });
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
