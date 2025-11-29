import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GenerateProductImageUseCase, ProductStyle } from '@application/usecases/tools/GenerateProductImageUseCase';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const VALID_STYLES: ProductStyle[] = [
    'ecommerce',
    'lifestyle',
    'flatlay',
    'minimal',
    'colorblock',
    'moody',
    'macro',
    'infographic',
    'ugc',
    'pinterest'
];

export class ProductImageController {
    constructor(
        private generateProductImageUseCase: GenerateProductImageUseCase
    ) { }

    generate = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { productName, productDescription, style, aspectRatio, resolution } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!req.user || !req.user.userId) {
            throw new AppError(401, 'User not authenticated');
        }
        const userId = req.user.userId;

        if (!productName || productName.trim() === '') {
            throw new AppError(400, 'Product name is required');
        }

        if (!style || !VALID_STYLES.includes(style)) {
            throw new AppError(400, `Invalid style. Must be one of: ${VALID_STYLES.join(', ')}`);
        }

        // Get product images (up to 5)
        const productImages = files?.productImages || [];
        if (productImages.length === 0) {
            throw new AppError(400, 'At least one product image is required');
        }
        if (productImages.length > 5) {
            throw new AppError(400, 'Maximum 5 product images allowed');
        }

        // Get reference image (optional, only 1)
        const referenceImages = files?.referenceImage || [];
        const referenceImage = referenceImages.length > 0 ? referenceImages[0] : undefined;

        const result = await this.generateProductImageUseCase.execute({
            userId,
            productName: productName.trim(),
            productDescription: productDescription?.trim(),
            style: style as ProductStyle,
            productImages,
            referenceImage,
            aspectRatio,
            resolution
        });

        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}
