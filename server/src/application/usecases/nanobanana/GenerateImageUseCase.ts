import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { TemplateModel } from '@infrastructure/database/models/TemplateModel';
import { StyleUsageModel } from '@infrastructure/database/models/StyleUsageModel';

export interface GenerateImageRequest {
  userId: string;
  prompt: string;
  numImages?: number;
  imageSize?: string;
  uploadedImages?: Express.Multer.File[];
  characterImageUrls?: string[];
  templateId?: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  imageId: string;
  prompt: string;
  aspectRatio?: string;
}

export class GenerateImageUseCase {
  constructor(
    private googleAIService: GoogleAIService,
    private fileUploadService: IFileUploadService,
    private generatedImageRepository: IGeneratedImageEntityRepository
  ) {}

  async execute(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    const { userId, prompt, imageSize = '1:1', uploadedImages = [], characterImageUrls = [], templateId } = request;

    // Note: Google AI currently generates one image at a time
    // For multiple images, we'd need to make multiple calls

    // Prepare reference images as base64 if provided
    const referenceImages: { mimeType: string; data: string }[] = [];
    const referenceImageUrls: string[] = [];
    
    if (uploadedImages && uploadedImages.length > 0) {
      for (const file of uploadedImages) {
        // Convert to base64 for Google AI API
        const base64Data = file.buffer.toString('base64');
        referenceImages.push({
          mimeType: file.mimetype,
          data: base64Data
        });

        // Also save locally for reference tracking
        const uploadResult = await this.fileUploadService.uploadImage(file, 'nero/references');
        referenceImageUrls.push(uploadResult.url);
      }
    }

    // Handle character images from URLs
    if (characterImageUrls && characterImageUrls.length > 0) {
      console.log('📥 Downloading character images:', characterImageUrls.length);
      for (const imageUrl of characterImageUrls) {
        try {
          // Download image from URL
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.error(`Failed to download character image from ${imageUrl}`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Data = buffer.toString('base64');
          
          // Determine mime type from response or URL
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          referenceImages.push({
            mimeType: contentType,
            data: base64Data
          });
          
          // Track the URL for reference
          referenceImageUrls.push(imageUrl);
        } catch (error) {
          console.error(`Error downloading character image from ${imageUrl}:`, error);
          // Continue with other images even if one fails
        }
      }
    }

    // Call Google AI API (synchronous)
    console.log('🚀 Calling Google AI API for generation:', { 
      prompt: prompt.substring(0, 100) + '...', 
      imageSize, 
      totalReferenceImages: referenceImages.length,
      uploadedImagesCount: uploadedImages.length,
      characterImagesCount: characterImageUrls.length
    });

    const response = await this.googleAIService.generateImage({
      prompt,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      aspectRatio: imageSize as any,
      responseModalities: ['Image'] // Only return image, no text
    });

    // Extract image data from response
    const imageResult = this.googleAIService.extractImageFromResponse(response);
    
    if (!imageResult) {
      throw new Error('No image returned from Google AI API');
    }

    // Save the generated image to local storage
    const imageBuffer = Buffer.from(imageResult.data, 'base64');
    const mimeType = imageResult.mimeType || 'image/png';
    const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';
    const imageFile: Express.Multer.File = {
      buffer: imageBuffer,
      mimetype: mimeType,
      originalname: `generated-${Date.now()}.${ext}`,
      fieldname: 'image',
      encoding: '7bit',
      size: imageBuffer.length,
      stream: null as any,
      destination: '',
      filename: '',
      path: ''
    };

    const uploadResult = await this.fileUploadService.uploadImage(imageFile, 'nero/generated');
    const localImageUrl = uploadResult.url;

    console.log('✅ Image generated and saved locally:', localImageUrl);

    // Create generated image record with completed status immediately
    const generatedImage = await this.generatedImageRepository.create({
      userId,
      prompt,
      type: 'TEXTTOIAMGE',
      imageUrl: localImageUrl,
      referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
      templateId,
      status: 'completed',
      completedAt: new Date()
    });

    // Track style usage if template was used
    if (templateId) {
      try {
        // Increment template usage count
        await TemplateModel.findByIdAndUpdate(
          templateId,
          { $inc: { usageCount: 1 } }
        );

        // Record style usage
        await StyleUsageModel.create({
          templateId,
          userId,
          generatedImageId: generatedImage.id
        });
      } catch (error) {
        console.error('Failed to track style usage:', error);
        // Don't fail the generation if tracking fails
      }
    }

    return {
      imageUrl: localImageUrl,
      imageId: generatedImage.id,
      prompt,
      aspectRatio: imageSize
    };
  }
}
