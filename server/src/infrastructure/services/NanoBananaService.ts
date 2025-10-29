import axios from 'axios';

export interface NanoBananaGenerateRequest {
  prompt: string;
  numImages?: number;
  imageUrls?: string[];
  type: 'IMAGETOIAMGE' | 'TEXTTOIAMGE';
  watermark?: string;
  image_size?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';
  callBackUrl: string;
}

export interface NanoBananaGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface NanoBananaCallbackData {
  code: number; // 200 = success, 400 = content policy violation, 500 = internal error, 501 = generation failed
  msg: string;
  data: {
    taskId: string;
    info: {
      resultImageUrl: string;
    };
  };
}

export interface NanoBananaTaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    paramJson: string;
    completeTime: string;
    response: {
      originImageUrl: string;
      resultImageUrl: string;
    };
    successFlag: 0 | 1 | 2 | 3; // 0-generating, 1-success, 2-create task failed, 3-generation failed
    errorCode: number;
    errorMessage: string;
    createTime: string;
  };
}

export class NanoBananaService {
  private apiKey: string;
  private baseUrl: string = 'https://api.nanobananaapi.ai';

  constructor() {
    this.apiKey = process.env.NANOBANANA_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  NanoBanana API key not configured. Image generation will not work.');
    }
  }

  async generateImage(request: NanoBananaGenerateRequest): Promise<NanoBananaGenerateResponse> {
    if (!this.apiKey) {
      throw new Error('NanoBanana API key is not configured');
    }

    try {
      const response = await axios.post<NanoBananaGenerateResponse>(
        `${this.baseUrl}/api/v1/nanobanana/generate`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Failed to generate image');
      }

      return response.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.msg || error.message;
        throw new Error(`NanoBanana API error: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Check task status directly from NanoBanana API
   * This is needed because callbacks won't work on localhost
   */
  async getTaskStatus(taskId: string): Promise<NanoBananaTaskStatusResponse> {
    if (!this.apiKey) {
      throw new Error('NanoBanana API key is not configured');
    }

    try {
      const response = await axios.get<NanoBananaTaskStatusResponse>(
        `${this.baseUrl}/api/v1/nanobanana/record-info`,
        {
          params: {
            taskId
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Failed to get task status');
      }

      return response.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.msg || error.message;
        throw new Error(`NanoBanana API error: ${message}`);
      }
      throw error;
    }
  }

  getCallbackUrl(): string {
    // Get the base URL from environment or default
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:2000';
    return `${baseUrl}/api/v1/nanobanana/callback`;
  }
}

