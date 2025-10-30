import apiClient from './apiClient'

export interface PopularStyle {
  id: string
  name: string
  imageUrl: string
  usageCount: number
}

export interface DashboardStats {
  totalUsers: number
  totalUsersChange: number
  activeUsers: number
  activeUsersChange: number
  totalTemplates: number
  totalTemplatesChange: number
  totalCharacters: number
  totalCharactersChange: number
  recentActivity: ActivityItem[]
  popularStyles: PopularStyle[]
}

export interface ActivityItem {
  id: string
  type: 'user' | 'template' | 'character'
  message: string
  timestamp: string
  icon?: string
}

export interface Template {
  id: string
  imageUrl: string
  prompt: string
  style?: string
  category: string
}

export interface GeneratedImage {
  id: string
  userId: string
  type: 'generate' | 'edit'
  prompt: string
  imageUrl: string
  publicId: string
  parentId?: string
  templateId?: string
  metadata: {
    aspectRatio?: string
    quality?: string
    style?: string
    sourceImages?: string[]
  }
  createdAt: string
  template?: Template
}

export interface GeneratedImagesResponse {
  images: GeneratedImage[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats')
    return response.data.data
  },

  async getGeneratedImages(page: number = 1, limit: number = 50): Promise<GeneratedImagesResponse> {
    const response = await apiClient.get('/dashboard/generated-images', {
      params: { page, limit }
    })
    return response.data.data
  }
}
