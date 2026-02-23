import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { ErrorLogService } from '@application/services/ErrorLogService';
import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';

export interface GenerateShopProductImageRequest {
    shopId: string;
    productName: string;
    productDescription?: string;
    style: string;
    productImages: Express.Multer.File[];
    referenceImage?: Express.Multer.File;
    aspectRatio?: string;
    modelType?: 'normal' | 'pro';
}

export interface GenerateShopProductImageResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
    imageUrl: string;
    imageId: string;
}

// Default fallback style prompt (used when DB style not found)
const DEFAULT_STYLE_PROMPT = `Professional e-commerce product photography style. Pure white seamless background (#FFFFFF). 
    Soft, even studio lighting with no harsh shadows. Product is the sole focus, perfectly centered.
    Clean, commercial look suitable for Amazon, Shopify, or marketplace listings.
    High-key lighting, crisp details, professional product isolation.`;

export class GenerateShopProductImageUseCase {
    constructor(
        private googleAIService: GoogleAIService,
        private shopRepository: IShopRepository,
        private fileUploadService: IFileUploadService,
        private generatedImageRepository: IGeneratedImageEntityRepository,
        private errorLogService?: ErrorLogService,
        private shopStyleRepository?: IShopStyleRepository
    ) { }

    async execute(request: GenerateShopProductImageRequest): Promise<GenerateShopProductImageResponse> {
        const { shopId, productName, productDescription, style, productImages, referenceImage, aspectRatio, modelType } = request;

        const currentModelType = modelType || 'pro';
        const creditCost = currentModelType === 'pro' ? 15 : 5;
        const apiModel = currentModelType === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

        // Check shop credit
        const shop = await this.shopRepository.findById(shopId);
        if (!shop || shop.credit < creditCost) {
            throw new Error(`اعتبار شما کافی نیست. تولید این تصویر نیاز به ${creditCost} اعتبار دارد.`);
        }

        // Upload product images for reference tracking
        const productImageUrls: string[] = [];
        for (const file of productImages) {
            const uploadResult = await this.fileUploadService.uploadImage(file, 'nero/products');
            productImageUrls.push(uploadResult.url);
        }

        // Upload reference image if provided
        let referenceImageUrl: string | undefined;
        if (referenceImage) {
            const uploadResult = await this.fileUploadService.uploadImage(referenceImage, 'nero/references');
            referenceImageUrl = uploadResult.url;
        }

        // Build the comprehensive prompt - look up style from DB
        let stylePrompt = DEFAULT_STYLE_PROMPT;
        if (this.shopStyleRepository) {
            const dbStyle = await this.shopStyleRepository.findBySlug(style);
            if (dbStyle && dbStyle.prompt) {
                stylePrompt = dbStyle.prompt;
            }
        }

        // Detect language from product name (Persian/Arabic characters)
        const isPersian = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(productName);
        const languageInstruction = style === 'infographic'
            ? `\nLANGUAGE REQUIREMENT: All text overlays on the image MUST be in ${isPersian ? 'Persian/Farsi (فارسی)' : 'English'}. Match the language of the product name exactly.`
            : '';

        // Build dynamic instructions based on whether a reference image is provided
        const baseInstructions = `
- The provided product image must be the MAIN FOCUS of the generated image
- Preserve the product's exact appearance, colors, shape, and proportions from the original product image
- Create a professional, high-quality product photograph
- The product should look premium and desirable
- Lighting should enhance the product's features and textures
- Output should be suitable for e-commerce, marketing, or social media use
- Ensure the product is clearly visible and well-lit
- Make the image look professionally shot with proper depth of field`.trim();

        const referenceImageInstructions = referenceImage ? `
- IMPORTANT: You have received a REFERENCE IMAGE in addition to the product images.
- Use the REFERENCE IMAGE as the MAIN BACKGROUND, SCENE, and ENVIRONMENT.
- Keep the exact overall vibe, colors, props, and setting of the reference image.
- PLACE the product naturally into the reference image's scene.
- REPLACE whatever main subject was naturally in the reference image with the provided product.
- Ensure the lighting on the product matches the lighting of the reference scene.`.trim() : '\n- Composition should draw the eye to the product';

        const fullPrompt = `
Create a stunning product photograph for: "${productName}"
${productDescription ? `Product details: ${productDescription}` : ''}

STYLE REQUIREMENTS:
${stylePrompt}
${languageInstruction}

IMPORTANT INSTRUCTIONS:
${baseInstructions}
${referenceImageInstructions}

Generate a beautiful, commercial-quality product photograph that would make customers want to buy this product.
`.trim();

        console.log('🛍️ [Shop] Generating product image:', {
            shopId,
            productName,
            style,
            hasDescription: !!productDescription,
            aspectRatio: aspectRatio || '1:1',
        });

        // Prepare product images for Google AI
        const googleImages: { mimeType: string; data: string }[] = [];
        for (const file of productImages) {
            googleImages.push({
                mimeType: file.mimetype,
                data: file.buffer.toString('base64')
            });
        }

        // Add reference image if provided
        if (referenceImage) {
            googleImages.push({
                mimeType: referenceImage.mimetype,
                data: referenceImage.buffer.toString('base64')
            });
        }

        // Generate image using Google AI (always 1K for shop — no resolution selection)
        let aiResponse;
        try {
            // gemini-2.5-flash does not support the aspectRatio parameter
            const requestPayload: any = {
                prompt: fullPrompt,
                referenceImages: googleImages,
                resolution: '1K',
                model: apiModel
            };

            if (apiModel !== 'gemini-2.5-flash-image') {
                requestPayload.aspectRatio = (aspectRatio as any) || '1:1';
            }

            aiResponse = await this.googleAIService.generateImage(requestPayload);
        } catch (error: any) {
            if (this.errorLogService) {
                await this.errorLogService.logGenerationError(
                    error,
                    shopId,
                    {
                        productName,
                        style,
                        provider: 'Google AI',
                        operation: 'generateShopProductImage',
                        referenceImagesCount: googleImages.length
                    }
                );
            }
            throw error;
        }

        const imageResult = this.googleAIService.extractImageFromResponse(aiResponse);

        if (!imageResult) {
            const error = new Error('Failed to generate product image');
            if (this.errorLogService) {
                await this.errorLogService.logGenerationError(
                    error,
                    shopId,
                    {
                        productName,
                        style,
                        provider: 'Google AI',
                        operation: 'extractImage'
                    }
                );
            }
            throw error;
        }

        // Save the generated image
        const imageBuffer = Buffer.from(imageResult.data, 'base64');
        const mimeType = imageResult.mimeType || 'image/png';
        const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.split('/')[1] || 'png';
        const imageFile: Express.Multer.File = {
            buffer: imageBuffer,
            mimetype: mimeType,
            originalname: `shop - product - ${Date.now()}.${ext} `,
            fieldname: 'image',
            encoding: '7bit',
            size: imageBuffer.length,
            stream: null as any,
            destination: '',
            filename: '',
            path: ''
        };

        const uploadResult = await this.fileUploadService.uploadImage(imageFile, 'nero/products/generated');
        const localImageUrl = uploadResult.url;

        console.log('✅ [Shop] Product image generated and saved:', localImageUrl);

        // Combine all image URLs for storage
        const allImageUrls = [...productImageUrls];
        if (referenceImageUrl) {
            allImageUrls.push(referenceImageUrl);
        }

        // Save to repository (use shopId as the owner)
        const generatedImage = await this.generatedImageRepository.create({
            userId: shopId, // using shopId as owner identifier
            prompt: fullPrompt,
            type: 'PRODUCT',
            imageUrl: localImageUrl,
            referenceImageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
            status: 'completed',
            completedAt: new Date()
        });

        // Increment shop generation count & decrement credit
        await this.shopRepository.incrementGenerationCount(shopId);
        await this.shopRepository.decrementCredit(shopId, creditCost);
        console.log(`🏪 Shop ${shopId} generation count incremented, credit decremented by ${creditCost} `);

        return {
            image: imageResult.data,
            mimeType: imageResult.mimeType,
            prompt: fullPrompt,
            imageUrl: localImageUrl,
            imageId: generatedImage.id
        };
    }
}
