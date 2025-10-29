import apiClient from './api';
import type { User } from '@/core/domain/entities/User';

export interface SendCodeResponse {
  status: string;
  message: string;
}

export interface VerifyCodeResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface GoogleAuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  };
}

export interface GoogleUserData {
  googleId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export const authService = {
  /**
   * Send verification code to phone number
   */
  sendVerificationCode: async (phoneNumber: string): Promise<SendCodeResponse> => {
    const response = await apiClient.post<SendCodeResponse>('/auth/send-code', {
      phoneNumber,
    });
    return response.data;
  },

  /**
   * Verify code and login
   */
  verifyCode: async (phoneNumber: string, code: string): Promise<VerifyCodeResponse> => {
    const response = await apiClient.post<VerifyCodeResponse>('/auth/verify-code', {
      phoneNumber,
      code,
    });
    
    // Store tokens
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    if (response.data.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Google OAuth login
   */
  googleLogin: async (googleUserData: GoogleUserData): Promise<GoogleAuthResponse> => {
    const response = await apiClient.post<GoogleAuthResponse>('/auth/google', googleUserData);
    
    // Store tokens
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    if (response.data.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
