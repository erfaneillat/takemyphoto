import { GoogleAIService, GoogleAIGenerateRequest } from '../../../infrastructure/services/GoogleAIService';
import { LocalFileUploadService } from '../../../infrastructure/services/LocalFileUploadService';
import { ErrorLogService } from '../../services/ErrorLogService';

export interface UpscaleImageRequest {
    imageBuffer: Buffer;
    originalName: string;
    resolution: string;
    userId: string;
}

export interface UpscaleImageResponse {
    imageUrl: string;
    originalResolution: string;
    targetResolution: string;
}

export class UpscaleImageUseCase {
    constructor(
        private googleAIService: GoogleAIService,
        private fileUploadService: LocalFileUploadService,
        private errorLogService?: ErrorLogService
    ) { }

    async execute(request: UpscaleImageRequest): Promise<UpscaleImageResponse> {
        try {
            // Get original image dimensions (we'll use a simple approach without Sharp for now)
            const originalResolution = "unknown"; // Will be enhanced later with proper image processing

            // Convert image to base64 for Google AI API
            const base64Image = request.imageBuffer.toString('base64');
            const mimeType = this.getMimeTypeFromBuffer(request.imageBuffer);

            // Create upscaling prompt
            const upscalePrompt = this.createUpscalePrompt(request.resolution);

            // Prepare Google AI request
            const googleAIRequest: GoogleAIGenerateRequest = {
                prompt: upscalePrompt,
                referenceImages: [{
                    data: base64Image,
                    mimeType: mimeType
                }],
                resolution: request.resolution,
                responseModalities: ['Image']
            };

            console.log('🚀 Starting image upscaling:', {
                originalResolution,
                targetResolution: request.resolution,
                userId: request.userId
            });

            // Call Google AI API
            const googleResponse = await this.googleAIService.generateImage(googleAIRequest);

            // Extract upscaled image
            const imageData = this.googleAIService.extractImageFromResponse(googleResponse);

            if (!imageData) {
                throw new Error('No upscaled image returned from Google AI');
            }

            // Convert base64 to buffer
            const upscaledBuffer = Buffer.from(imageData.data, 'base64');

            // Generate filename
            const timestamp = Date.now();
            const filename = `upscaled-${request.resolution}-${timestamp}.png`;

            // Save upscaled image
            const multerFile: Express.Multer.File = {
                fieldname: 'image',
                originalname: filename,
                encoding: '7bit',
                mimetype: 'image/png',
                buffer: upscaledBuffer,
                size: upscaledBuffer.length,
                stream: null as any,
                destination: '',
                filename: '',
                path: ''
            };

            const uploadResult = await this.fileUploadService.uploadImage(multerFile, 'upscaled');

            console.log('✅ Image upscaled successfully:', {
                originalResolution,
                targetResolution: request.resolution,
                savedPath: uploadResult.url,
                userId: request.userId
            });

            return {
                imageUrl: uploadResult.url,
                originalResolution,
                targetResolution: request.resolution
            };

        } catch (error) {
            console.error('❌ Upscale image error:', error);

            // Log error for admin monitoring
            if (this.errorLogService) {
                await this.errorLogService.logGenerationError(
                    error instanceof Error ? error : new Error('Unknown upscale error'),
                    request.userId,
                    {
                        provider: 'google_ai',
                        operation: 'upscaleImage',
                        targetResolution: request.resolution,
                        originalName: request.originalName
                    }
                );
            }

            throw error;
        }
    }

    private createUpscalePrompt(resolution: string): string {
        const resolutionMap: { [key: string]: string } = {
            '1024x1024': '1K (1024x1024)',
            '2048x2048': '2K (2048x2048)',
            '4096x4096': '4K (4096x4096)'
        };

        const resolutionLabel = resolutionMap[resolution] || resolution;

        return `Please upscale this image to ${resolutionLabel} resolution while preserving all details, sharpness, and quality. 
    
Key requirements:
- Maintain the exact same composition and content
- Enhance details and sharpness for higher resolution
- Preserve all colors, lighting, and textures accurately
- Do not add, remove, or alter any elements in the image
- Focus on creating a crisp, high-quality upscaled version
- Ensure the output matches the requested ${resolutionLabel} dimensions exactly

The goal is to create a pixel-perfect upscaled version that looks identical to the original but with enhanced resolution and detail clarity.`;
    }

    private getMimeTypeFromBuffer(buffer: Buffer): string {
        // Check PNG signature
        if (buffer.length >= 8 &&
            buffer[0] === 0x89 && buffer[1] === 0x50 &&
            buffer[2] === 0x4E && buffer[3] === 0x47) {
            return 'image/png';
        }

        // Check JPEG signature
        if (buffer.length >= 3 &&
            buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return 'image/jpeg';
        }

        // Check WebP signature
        if (buffer.length >= 12 &&
            buffer.slice(0, 4).toString() === 'RIFF' &&
            buffer.slice(8, 12).toString() === 'WEBP') {
            return 'image/webp';
        }

        // Default to PNG if can't determine
        return 'image/png';
    }
}
