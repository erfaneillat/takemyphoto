import { Response } from 'express';
import { LicenseAuthRequest } from '../middleware/licenseAuthMiddleware';
import { GenerateShopProductImageUseCase, ProductStyle } from '@application/usecases/tools/GenerateShopProductImageUseCase';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
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

export class ShopProductImageController {
    constructor(
        private generateShopProductImageUseCase: GenerateShopProductImageUseCase,
        private generatedImageRepository: IGeneratedImageEntityRepository
    ) { }

    listImages = asyncHandler(async (req: LicenseAuthRequest, res: Response) => {
        if (!req.shop || !req.shop.id) {
            throw new AppError(401, 'Shop not authenticated');
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;

        const images = await this.generatedImageRepository.findByUserId(req.shop.id, limit, skip);

        res.status(200).json({
            status: 'success',
            data: { images }
        });
    });

    generate = asyncHandler(async (req: LicenseAuthRequest, res: Response) => {
        const { productName, productDescription, style, aspectRatio } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!req.shop || !req.shop.id) {
            throw new AppError(401, 'Shop not authenticated');
        }
        const shopId = req.shop.id;

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

        const result = await this.generateShopProductImageUseCase.execute({
            shopId,
            productName: productName.trim(),
            productDescription: productDescription?.trim(),
            style: style as ProductStyle,
            productImages,
            referenceImage,
            aspectRatio,
        });

        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}
