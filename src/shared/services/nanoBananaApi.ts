import { apiClient as api } from './api';

export interface GenerateImageRequest {
  prompt: string;
  numImages?: number;
  imageSize?: string;
  images?: File[];
  characterImageUrls?: string[];
}

export interface EditImageRequest {
  prompt: string;
  numImages?: number;
  imageSize?: string;
  images: File[];
  characterImageUrls?: string[];
}

export interface GenerateImageResponse {
  imageUrl: string;
  imageId: string;
  prompt: string;
  aspectRatio?: string;
}

export interface TaskStatusResponse {
  task: {
    id: string;
    taskId: string;
    userId: string;
    prompt: string;
    type: 'IMAGETOIAMGE' | 'TEXTTOIAMGE';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    imageUrls?: string[];
    referenceImageUrls?: string[];
    numImages: number;
    imageSize?: string;
    resultImageUrls?: string[];
    error?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  };
}

class NanoBananaApi {
  /**
   * Generate image from text (text-to-image)
   */
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    
    if (request.numImages) {
      formData.append('numImages', request.numImages.toString());
    }
    
    if (request.imageSize) {
      formData.append('imageSize', request.imageSize);
    }
    
    if (request.characterImageUrls && request.characterImageUrls.length > 0) {
      formData.append('characterImageUrls', JSON.stringify(request.characterImageUrls));
    }
    
    if (request.images) {
      request.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post<{ status: string; data: GenerateImageResponse }>(
      '/nanobanana/generate',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  /**
   * Edit image from image (image-to-image)
   */
  async editImage(request: EditImageRequest): Promise<GenerateImageResponse> {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    
    if (request.numImages) {
      formData.append('numImages', request.numImages.toString());
    }
    
    if (request.imageSize) {
      formData.append('imageSize', request.imageSize);
    }
    
    if (request.characterImageUrls && request.characterImageUrls.length > 0) {
      formData.append('characterImageUrls', JSON.stringify(request.characterImageUrls));
    }
    
    request.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post<{ status: string; data: GenerateImageResponse }>(
      '/nanobanana/edit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  /**
   * Get task status
   */
  // Deprecated: task status is not used in Google AI synchronous flow
  async getTaskStatus(_taskId: string): Promise<TaskStatusResponse> {
    throw new Error('getTaskStatus is deprecated: Google AI responses are synchronous');
  }

  /**
   * Poll task status until completion
   */
  // Deprecated: polling is not used in Google AI synchronous flow
  async pollTaskStatus(
    _taskId: string,
    _onUpdate?: (task: TaskStatusResponse['task']) => void,
    _maxAttempts = 60,
    _intervalMs = 5000
  ): Promise<TaskStatusResponse['task']> {
    throw new Error('pollTaskStatus is deprecated: Google AI responses are synchronous');
  }
}

export const nanoBananaApi = new NanoBananaApi();
