import { apiClient as api } from './api';

export interface GeneratedImage {
  id: string;
  userId: string;
  taskId: string;
  prompt: string;
  type: 'TEXTTOIAMGE' | 'IMAGETOIAMGE';
  imageUrl: string;
  originImageUrl?: string;
  referenceImageUrls?: string[];
  characterIds?: string[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GeneratedImagesResponse {
  status: 'success';
  data: {
    images: GeneratedImage[];
    pagination: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
  };
}

export const generatedImagesApi = {
  /**
   * Get user's generated images with pagination
   */
  async getUserImages(limit = 50, skip = 0): Promise<GeneratedImagesResponse> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await api.get<GeneratedImagesResponse>(
      '/nanobanana/images',
      {
        params: { limit, skip },
      }
    );

    return response.data;
  },

  /**
   * Get completed images only
   */
  async getCompletedImages(limit = 50, skip = 0): Promise<GeneratedImage[]> {
    const response = await this.getUserImages(limit, skip);
    return response.data.images.filter(img => img.status === 'completed');
  },

  /**
   * Get images by type
   */
  async getImagesByType(type: 'TEXTTOIAMGE' | 'IMAGETOIAMGE', limit = 50, skip = 0): Promise<GeneratedImage[]> {
    const response = await this.getUserImages(limit, skip);
    return response.data.images.filter(img => img.type === type);
  }
};
