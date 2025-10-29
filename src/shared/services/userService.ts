import apiClient from './api';
import type { User } from '@/core/domain/entities/User';

export interface UserProfileStats {
  totalEdits: number;
  editsThisMonth: number;
  favoriteCount: number;
}

export interface UserProfileResponse {
  status: string;
  data: {
    user: User;
    stats: UserProfileStats;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export const userService = {
  /**
   * Get current user
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ status: string; data: { user: User } }>('/users/me');
    return response.data.data.user;
  },

  /**
   * Get user profile with statistics
   */
  getProfile: async (): Promise<UserProfileResponse['data']> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.patch<{ status: string; data: { user: User } }>(
      '/users/profile',
      data
    );
    return response.data.data.user;
  },
};
