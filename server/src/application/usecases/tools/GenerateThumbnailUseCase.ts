import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { GoogleAIService } from '@infrastructure/services/GoogleAIService';

export interface GenerateThumbnailRequest {
    description: string;
    language: string;
    images?: Express.Multer.File[];
    aspectRatio?: string;
    visualDescription?: string;
}

export interface GenerateThumbnailResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
}

export class GenerateThumbnailUseCase {
    constructor(
        private openAIService: OpenAIService,
        private googleAIService: GoogleAIService
    ) { }

    async execute(request: GenerateThumbnailRequest): Promise<GenerateThumbnailResponse> {
        // Determine type based on aspect ratio
        const type = request.aspectRatio === '9:16' ? 'Instagram Cover' : 'YouTube Thumbnail';

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
            aspectRatio: (request.aspectRatio as any) || '16:9'
        };

        const aiResponse = await this.googleAIService.generateImage(googleAIRequest);

        const imageResult = this.googleAIService.extractImageFromResponse(aiResponse);

        if (!imageResult) {
            throw new Error('Failed to generate thumbnail image');
        }

        return {
            image: imageResult.data,
            mimeType: imageResult.mimeType,
            prompt: prompt
        };
    }
}

