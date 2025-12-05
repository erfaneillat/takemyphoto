import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { AppError } from '@presentation/middleware/errorHandler';

// Star cost for image-to-prompt is flat 5 stars
const IMAGE_TO_PROMPT_STAR_COST = 5;

export interface ImageToPromptRequest {
  imageFile: Express.Multer.File;
  userId: string;
}

export interface ImageToPromptResponse {
  prompt: string;
  detectedElements: string[];
}

export class ImageToPromptUseCase {
  constructor(
    private openAIService: OpenAIService,
    private userRepository?: IUserRepository
  ) { }

  async execute(request: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    const { imageFile, userId } = request;

    // Check user's star balance (all users pay stars now)
    let user: any = null;
    if (this.userRepository) {
      user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.stars < IMAGE_TO_PROMPT_STAR_COST) {
        throw new AppError(403, `INSUFFICIENT_STARS: You need ${IMAGE_TO_PROMPT_STAR_COST} stars for image-to-prompt. You have ${user.stars} stars. Please upgrade your subscription to get more stars.`);
      }
    }

    // Convert image buffer to base64
    const imageBase64 = imageFile.buffer.toString('base64');
    const mimeType = imageFile.mimetype || 'image/jpeg';

    // Call OpenAI Vision API to analyze the image
    const result = await this.openAIService.imageToPrompt({
      imageBase64,
      mimeType
    });

    // Deduct stars AFTER successful image-to-prompt
    if (this.userRepository && user) {
      await this.userRepository.decrementStars(userId, IMAGE_TO_PROMPT_STAR_COST);
      console.log(`⭐ User ${userId} consumed ${IMAGE_TO_PROMPT_STAR_COST} stars for image-to-prompt. Remaining: ${user.stars - IMAGE_TO_PROMPT_STAR_COST}`);
    }

    return result;
  }
}
