import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { AppError } from '@presentation/middleware/errorHandler';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { ErrorLogService } from '@application/services/ErrorLogService';

// Product photography styles
export type ProductStyle =
    | 'ecommerce'      // Clean white background, professional
    | 'lifestyle'      // Product in real-life scene
    | 'flatlay'        // Top-down Pinterest style
    | 'minimal'        // Simple, clean, elegant
    | 'colorblock'     // Bold colorful backgrounds
    | 'moody'          // Dark, dramatic lighting
    | 'macro'          // Close-up detail shots
    | 'infographic'    // Product with info overlay style
    | 'ugc'            // User-generated content style
    | 'pinterest';     // Pinterest aesthetic (combination)

export interface GenerateProductImageRequest {
    userId: string;
    productName: string;
    productDescription?: string;
    style: ProductStyle;
    productImages: Express.Multer.File[];  // Up to 5 product images
    referenceImage?: Express.Multer.File;   // Optional single reference image
    aspectRatio?: string;
    resolution?: string;
}

export interface GenerateProductImageResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
    imageUrl: string;
    imageId: string;
}

// Style prompts mapping
const STYLE_PROMPTS: Record<ProductStyle, string> = {
    ecommerce: `Professional e-commerce product photography style. Pure white seamless background (#FFFFFF). 
    Soft, even studio lighting with no harsh shadows. Product is the sole focus, perfectly centered.
    Clean, commercial look suitable for Amazon, Shopify, or marketplace listings.
    High-key lighting, crisp details, professional product isolation.`,

    lifestyle: `Lifestyle product photography style. The product is shown in a natural, real-world setting.
    Warm, inviting atmosphere with contextual props. The scene tells a story of product usage.
    Soft natural lighting, possibly from a window. Lifestyle props complement but don't overshadow the product.
    Magazine-quality editorial feel, aspirational yet relatable.`,

    flatlay: `Flat lay photography style, shot directly from above (90-degree angle).
    Carefully arranged items on a clean surface. Pinterest-worthy aesthetic composition.
    Complementary props artfully scattered around the main product. Perfect symmetry or intentional asymmetry.
    Instagram-ready, shareable, visually satisfying arrangement with breathing room between items.`,

    minimal: `Minimalist product photography style. Clean, uncluttered composition with maximum negative space.
    Simple solid color background (white, beige, light gray, or soft pastels).
    1-2 subtle accent elements only. Elegant, premium, luxury brand aesthetic.
    Less is more approach, sophisticated and refined, Scandinavian design influence.`,

    colorblock: `Bold color block product photography style. Vibrant, saturated background colors.
    Eye-catching contrast between product and background. Pop art influence, energetic and youthful.
    May use complementary or contrasting color schemes. Perfect for social media, ads, and Gen-Z targeting.
    High impact visual, attention-grabbing, trendy aesthetic.`,

    moody: `Moody, dark product photography style. Deep shadows and dramatic directional lighting.
    Dark background (black, charcoal, deep navy). High contrast, cinematic feel.
    Chiaroscuro lighting technique. Premium, luxury, mysterious atmosphere.
    Perfect for high-end products, watches, perfumes, whiskey, leather goods.`,

    macro: `Macro/detail product photography style. Extreme close-up focusing on textures and details.
    Sharp focus on specific product features (stitching, materials, logos, craftsmanship).
    Shows quality and attention to detail. Partially visible product creating intrigue.
    Technical precision, showcasing build quality and premium materials.`,

    infographic: `Product infographic style photography. Clean product image with text overlays showing product features.
    Add callouts, arrows, and feature descriptions directly on the image. Clear, organized layout.
    Multiple angles or features highlighted. Educational and informative approach.
    IMPORTANT: Any text on the image MUST be in the SAME LANGUAGE as the product name provided by the user.
    If product name is in Persian/Farsi, all text overlays must be in Persian/Farsi.
    If product name is in English, all text overlays must be in English.
    Perfect for Amazon listings, product pages, and advertising banners.`,

    ugc: `User-generated content (UGC) style product photography. Authentic, slightly casual mobile photography feel.
    Natural, unpolished but appealing. Real person's perspective, relatable setting.
    Not overly staged or perfect. Social proof aesthetic, trustworthy and genuine.
    Instagram story quality, casual lifestyle integration.`,

    pinterest: `Pinterest-worthy product photography combining flat lay and lifestyle elements.
    Highly aesthetic, save-worthy composition. Warm, inviting color palette.
    Curated props that enhance the mood. Natural light feel, soft shadows.
    Aspirational yet achievable lifestyle. Perfect for mood boards and inspiration.`
};

export class GenerateProductImageUseCase {
    constructor(
        private googleAIService: GoogleAIService,
        private userRepository: IUserRepository,
        private fileUploadService: IFileUploadService,
        private generatedImageRepository: IGeneratedImageEntityRepository,
        private errorLogService?: ErrorLogService
    ) { }

    async execute(request: GenerateProductImageRequest): Promise<GenerateProductImageResponse> {
        const { userId, productName, productDescription, style, productImages, referenceImage, aspectRatio, resolution } = request;

        // Check user's plan and star balance
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const isUnlimited = user.subscription && user.subscription !== 'free';
        if (!isUnlimited) {
            if (user.stars <= 0) {
                throw new AppError(403, 'INSUFFICIENT_STARS: You have run out of stars. Please upgrade your subscription to continue.');
            }
            await this.userRepository.decrementStars(userId, 1);
            console.log(`⭐ User ${userId} consumed 1 star for product image generation. Remaining: ${user.stars - 1}`);
        } else {
            console.log(`♾️ Unlimited product image generation for ${user.subscription} user ${userId}`);
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

        // Build the comprehensive prompt
        const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.ecommerce;

        // Detect language from product name (Persian/Arabic characters)
        const isPersian = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(productName);
        const languageInstruction = style === 'infographic'
            ? `\nLANGUAGE REQUIREMENT: All text overlays on the image MUST be in ${isPersian ? 'Persian/Farsi (فارسی)' : 'English'}. Match the language of the product name exactly.`
            : '';

        const fullPrompt = `
Create a stunning product photograph for: "${productName}"
${productDescription ? `Product details: ${productDescription}` : ''}

STYLE REQUIREMENTS:
${stylePrompt}
${languageInstruction}

IMPORTANT INSTRUCTIONS:
- The provided product image must be the MAIN FOCUS of the generated image
- Preserve the product's exact appearance, colors, shape, and proportions from the reference
- Create a professional, high-quality product photograph
- The product should look premium and desirable
- Lighting should enhance the product's features and textures
- Composition should draw the eye to the product
- Output should be suitable for e-commerce, marketing, or social media use
- Ensure the product is clearly visible and well-lit
- Make the image look professionally shot with proper depth of field

Generate a beautiful, commercial-quality product photograph that would make customers want to buy this product.
`.trim();

        console.log('🛍️ Generating product image:', {
            productName,
            style,
            hasDescription: !!productDescription,
            aspectRatio: aspectRatio || '1:1',
            resolution: resolution || '1K'
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

        // Generate image using Google AI
        let aiResponse;
        try {
            aiResponse = await this.googleAIService.generateImage({
                prompt: fullPrompt,
                referenceImages: googleImages,
                aspectRatio: (aspectRatio as any) || '1:1',
                resolution: resolution || '1K'
            });
        } catch (error: any) {
            if (this.errorLogService) {
                await this.errorLogService.logGenerationError(
                    error,
                    userId,
                    {
                        productName,
                        style,
                        provider: 'Google AI',
                        operation: 'generateProductImage',
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
                    userId,
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
            originalname: `product-${Date.now()}.${ext}`,
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

        console.log('✅ Product image generated and saved:', localImageUrl);

        // Combine all image URLs for storage
        const allImageUrls = [...productImageUrls];
        if (referenceImageUrl) {
            allImageUrls.push(referenceImageUrl);
        }

        // Save to repository
        const generatedImage = await this.generatedImageRepository.create({
            userId,
            prompt: fullPrompt,
            type: 'PRODUCT',
            imageUrl: localImageUrl,
            referenceImageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
            status: 'completed',
            completedAt: new Date()
        });

        return {
            image: imageResult.data,
            mimeType: imageResult.mimeType,
            prompt: fullPrompt,
            imageUrl: localImageUrl,
            imageId: generatedImage.id
        };
    }
}
