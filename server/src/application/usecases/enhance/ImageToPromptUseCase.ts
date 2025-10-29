import { OpenAIService } from '@infrastructure/services/OpenAIService';

export interface ImageToPromptRequest {
  imageFile: Express.Multer.File;
  userId: string;
}

export interface ImageToPromptResponse {
  prompt: string;
  detectedElements: string[];
}

export class ImageToPromptUseCase {
  constructor(private openAIService: OpenAIService) {}

  async execute(request: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    const { imageFile } = request;

    // Convert image buffer to base64
    const imageBase64 = imageFile.buffer.toString('base64');
    const mimeType = imageFile.mimetype || 'image/jpeg';

    // Call OpenAI Vision API to analyze the image
    const result = await this.openAIService.imageToPrompt({
      imageBase64,
      mimeType
    });

    return result;
  }
}
