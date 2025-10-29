import apiClient from './api';

export interface EnhanceOptions {
  upscale: boolean;
  denoise: boolean;
  enhanceColors: boolean;
  sharpen: boolean;
  autoFix: boolean;
}

export interface EnhanceImageResponse {
  url: string;
  width: number;
  height: number;
}

export interface UpscaleImageResponse {
  url: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export const enhanceApi = {
  // Enhance image with multiple options
  enhanceImage: async (imageFile: File, options: EnhanceOptions): Promise<EnhanceImageResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('upscale', String(options.upscale));
    formData.append('denoise', String(options.denoise));
    formData.append('enhanceColors', String(options.enhanceColors));
    formData.append('sharpen', String(options.sharpen));
    formData.append('autoFix', String(options.autoFix));
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.post<{ 
      status: string; 
      data: { enhancedImage: EnhanceImageResponse } 
    }>('/enhance/enhance', formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 60000, // 60 seconds for image processing
    });

    return response.data.data.enhancedImage;
  },

  // Upscale image only
  upscaleImage: async (imageFile: File, scale: number = 2): Promise<UpscaleImageResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('scale', String(scale));
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.post<{ 
      status: string; 
      data: { upscaledImage: UpscaleImageResponse } 
    }>('/enhance/upscale', formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 60000, // 60 seconds for image processing
    });

    return response.data.data.upscaledImage;
  },
};
