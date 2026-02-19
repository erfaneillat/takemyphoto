import { Response } from 'express';
import { LicenseAuthRequest } from '../middleware/licenseAuthMiddleware';
import { GenerateShopProductImageUseCase } from '@application/usecases/tools/GenerateShopProductImageUseCase';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class ShopProductImageController {
    constructor(
        private generateShopProductImageUseCase: GenerateShopProductImageUseCase,
        private generatedImageRepository: IGeneratedImageEntityRepository,
        private shopStyleRepository: IShopStyleRepository
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

        // Validate style against database
        if (!style) {
            throw new AppError(400, 'Style is required');
        }
        const dbStyle = await this.shopStyleRepository.findBySlug(style);
        if (!dbStyle) {
            throw new AppError(400, `Invalid style: "${style}"`);
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
            style: style,
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

