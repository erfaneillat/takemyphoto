import axios from 'axios';

export interface GoogleAIGenerateRequest {
  prompt: string;
  referenceImages?: { mimeType: string; data: string }[]; // base64 encoded images
  aspectRatio?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';
  responseModalities?: ('Text' | 'Image')[];
}

export interface GoogleAIGenerateResponse {
  candidates: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string; // base64 image data
        };
        inline_data?: {
          mime_type: string;
          data: string; // base64 image data
        };
      }>;
    };
    finishReason?: string;
    index?: number;
    safetyRatings?: any[];
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleAIService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private model: string = 'gemini-3-pro-image-preview';

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  Google AI API key not configured. Image generation will not work.');
    }
  }

  /**
   * Generate or edit image using Google AI Gemini 3 Pro Image Preview model
   * This is a synchronous operation that returns the image immediately
   */
  async generateImage(request: GoogleAIGenerateRequest): Promise<GoogleAIGenerateResponse> {
    if (!this.apiKey) {
      throw new Error('Google AI API key is not configured');
    }

    try {
      // Build parts array - text prompt always comes first
      const parts: any[] = [
        { text: request.prompt }
      ];

      // Add reference images if provided (for image-to-image editing)
      if (request.referenceImages && request.referenceImages.length > 0) {
        for (const image of request.referenceImages) {
          parts.push({
            inline_data: {
              mime_type: image.mimeType,
              data: image.data
            }
          });
        }
      }

      // Build request body
      const requestBody: any = {
        contents: [{
          role: 'user',
          parts
        }]
      };

      // Add generation config if needed
      if (request.aspectRatio || request.responseModalities) {
        requestBody.generationConfig = {};

        if (request.aspectRatio) {
          requestBody.generationConfig.imageConfig = {
            aspectRatio: request.aspectRatio
          };
        }

        if (request.responseModalities) {
          requestBody.generationConfig.responseModalities = request.responseModalities;
        }
      }

      console.log('🚀 Calling Google AI API:', {
        model: this.model,
        prompt: request.prompt.substring(0, 100) + '...',
        hasImages: request.referenceImages && request.referenceImages.length > 0,
        aspectRatio: request.aspectRatio
      });

      const response = await axios.post<GoogleAIGenerateResponse>(
        `${this.baseUrl}/models/${this.model}:generateContent`,
        requestBody,
        {
          headers: {
            'x-goog-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Google AI API');
      }

      const firstHasImage = this.extractImageFromResponse(response.data) !== null;
      console.log('✅ Google AI API response received:', {
        candidates: response.data.candidates.length,
        hasImage: firstHasImage,
        finishReasons: response.data.candidates.map(c => c.finishReason)
      });

      // Fallback: if no image was returned, retry without forcing responseModalities
      if (!firstHasImage) {
        console.warn('⚠️  No image in first response. Retrying without responseModalities...');
        const fallbackBody: any = {
          contents: [{ role: 'user', parts }]
        };
        if (request.aspectRatio) {
          fallbackBody.generationConfig = {
            imageConfig: { aspectRatio: request.aspectRatio }
          };
        }

        const fallbackResponse = await axios.post<GoogleAIGenerateResponse>(
          `${this.baseUrl}/models/${this.model}:generateContent`,
          fallbackBody,
          {
            headers: {
              'x-goog-api-key': this.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        let fallbackHasImage = this.extractImageFromResponse(fallbackResponse.data) !== null;
        console.log('🔁 Fallback response received:', {
          candidates: fallbackResponse.data.candidates?.length,
          hasImage: fallbackHasImage
        });

        // Second fallback: try allowing text+image explicitly
        if (!fallbackHasImage) {
          console.warn('⚠️  Still no image. Retrying with responseModalities = ["Text", "Image"]');
          const secondBody: any = {
            contents: [{ role: 'user', parts }],
            generationConfig: {
              responseModalities: ['Text', 'Image']
            }
          };
          if (request.aspectRatio) {
            secondBody.generationConfig.imageConfig = { aspectRatio: request.aspectRatio };
          }

          const secondResponse = await axios.post<GoogleAIGenerateResponse>(
            `${this.baseUrl}/models/${this.model}:generateContent`,
            secondBody,
            {
              headers: {
                'x-goog-api-key': this.apiKey,
                'Content-Type': 'application/json'
              }
            }
          );

          fallbackHasImage = this.extractImageFromResponse(secondResponse.data) !== null;
          console.log('🔁 Second fallback response received:', {
            candidates: secondResponse.data.candidates?.length,
            hasImage: fallbackHasImage
          });

          return secondResponse.data;
        }

        return fallbackResponse.data;
      }

      return response.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        console.error('❌ Google AI API error:', message);
        throw new Error(`Google AI API error: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Extract image data from Google AI response
   * Returns base64 image data and mimeType from the first image part found
   */
  extractImageFromResponse(response: GoogleAIGenerateResponse): { data: string; mimeType: string } | null {
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('❌ No candidates in response:', response);
      return null;
    }

    for (const candidate of response.candidates) {
      if (!candidate || !candidate.content || !candidate.content.parts) {
        console.warn('⚠️  Candidate missing content or parts:', candidate);
        continue;
      }

      for (const part of candidate.content.parts) {
        const inline = (part as any).inlineData || (part as any).inline_data;
        if (inline && inline.data) {
          console.log('✅ Found image data in response');
          const mimeType = (inline as any).mimeType || (inline as any).mime_type || 'image/png';
          return { data: inline.data, mimeType };
        }
      }
    }

    console.error('❌ No image data found in response:', JSON.stringify(response, null, 2));
    return null;
  }

  /**
   * Extract text from Google AI response (if any)
   */
  extractTextFromResponse(response: GoogleAIGenerateResponse): string | null {
    if (!response || !response.candidates || response.candidates.length === 0) {
      return null;
    }

    for (const candidate of response.candidates) {
      if (!candidate || !candidate.content || !candidate.content.parts) {
        continue;
      }

      for (const part of candidate.content.parts) {
        if (part && part.text) {
          return part.text;
        }
      }
    }
    return null;
  }
}
