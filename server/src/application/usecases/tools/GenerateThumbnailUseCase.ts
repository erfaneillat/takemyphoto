import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { AppError } from '@presentation/middleware/errorHandler';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';

// Helper function to calculate star cost based on resolution
function getStarCost(resolution: string): number {
    return resolution === '4K' ? 20 : 10;
}

export interface GenerateThumbnailRequest {
    userId: string;
    description: string;
    language: string;
    images?: Express.Multer.File[];
    aspectRatio?: string;
    visualDescription?: string;
    resolution?: string;
}

export interface GenerateThumbnailResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
    imageUrl: string;
    imageId: string;
}

export class GenerateThumbnailUseCase {
    constructor(
        private openAIService: OpenAIService,
        private googleAIService: GoogleAIService,
        private userRepository: IUserRepository,
        private fileUploadService: IFileUploadService,
        private generatedImageRepository: IGeneratedImageEntityRepository
    ) { }

    async execute(request: GenerateThumbnailRequest): Promise<GenerateThumbnailResponse> {
        const { userId } = request;

        // Check user's star balance (all users pay stars now)
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const resolution = request.resolution || '2K';
        const starCost = getStarCost(resolution);
        if (user.stars < starCost) {
            throw new AppError(403, `INSUFFICIENT_STARS: You need ${starCost} stars for ${resolution} resolution. You have ${user.stars} stars. Please upgrade your subscription to get more stars.`);
        }

        // Determine type based on aspect ratio
        const type = request.aspectRatio === '9:16' ? 'Instagram Cover' : 'YouTube Thumbnail';

        // Prepare reference images
        const referenceImageUrls: string[] = [];
        if (request.images && request.images.length > 0) {
            for (const file of request.images) {
                const uploadResult = await this.fileUploadService.uploadImage(file, 'nero/references');
                referenceImageUrls.push(uploadResult.url);
            }
        }

        // 1. Generate prompt using OpenAI (using only text description)
        const prompt = await this.openAIService.generateThumbnailPrompt(
            request.description,
            request.language,
            type,
            request.visualDescription
        );

        // 2. Generate image using GoogleAI (Gemini)
        // We pass the generated prompt. 
        // We also pass the reference images to Gemini to guide the style/content if they exist.
        const referenceImages = request.images?.map(file => ({
            mimeType: file.mimetype,
            data: file.buffer.toString('base64')
        }));

        const googleAIRequest = {
            prompt: prompt,
            referenceImages: referenceImages,
            aspectRatio: (request.aspectRatio as any) || '16:9',
            resolution: request.resolution || '2K'
        };

        const aiResponse = await this.googleAIService.generateImage(googleAIRequest);

        const imageResult = this.googleAIService.extractImageFromResponse(aiResponse);

        if (!imageResult) {
            throw new Error('Failed to generate thumbnail image');
        }

        // Save the generated image
        const imageBuffer = Buffer.from(imageResult.data, 'base64');
        const mimeType = imageResult.mimeType || 'image/png';
        const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';
        const imageFile: Express.Multer.File = {
            buffer: imageBuffer,
            mimetype: mimeType,
            originalname: `thumbnail-${Date.now()}.${ext}`,
            fieldname: 'image',
            encoding: '7bit',
            size: imageBuffer.length,
            stream: null as any,
            destination: '',
            filename: '',
            path: ''
        };

        const uploadResult = await this.fileUploadService.uploadImage(imageFile, 'nero/thumbnails');
        const localImageUrl = uploadResult.url;

        // Save to repository
        const generatedImage = await this.generatedImageRepository.create({
            userId,
            prompt,
            type: 'THUMBNAIL',
            imageUrl: localImageUrl,
            referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
            status: 'completed',
            completedAt: new Date()
        });

        // Deduct stars AFTER successful generation
        await this.userRepository.decrementStars(userId, starCost);
        console.log(`⭐ User ${userId} consumed ${starCost} stars for ${resolution} thumbnail generation. Remaining: ${user.stars - starCost}`);

        return {
            image: imageResult.data,
            mimeType: imageResult.mimeType,
            prompt: prompt,
            imageUrl: localImageUrl,
            imageId: generatedImage.id
        };
    }
}

