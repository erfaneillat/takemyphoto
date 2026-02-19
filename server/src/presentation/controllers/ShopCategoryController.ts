import { Request, Response } from 'express';
import { CreateShopCategoryUseCase } from '@application/usecases/shop-category/CreateShopCategoryUseCase';
import { GetShopCategoriesUseCase } from '@application/usecases/shop-category/GetShopCategoriesUseCase';
import { UpdateShopCategoryUseCase } from '@application/usecases/shop-category/UpdateShopCategoryUseCase';
import { DeleteShopCategoryUseCase } from '@application/usecases/shop-category/DeleteShopCategoryUseCase';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IShopCategoryRepository } from '@core/domain/repositories/IShopCategoryRepository';
import { asyncHandler } from '../middleware/errorHandler';

export class ShopCategoryController {
    constructor(
        private createShopCategoryUseCase: CreateShopCategoryUseCase,
        private getShopCategoriesUseCase: GetShopCategoriesUseCase,
        private updateShopCategoryUseCase: UpdateShopCategoryUseCase,
        private deleteShopCategoryUseCase: DeleteShopCategoryUseCase,
        private fileUploadService: IFileUploadService,
        private shopCategoryRepository: IShopCategoryRepository
    ) { }

    getShopCategories = asyncHandler(async (req: Request, res: Response) => {
        const { isActive, types } = req.query;

        const filters: { isActive?: boolean; types?: string[] } = {};

        if (isActive === 'true') filters.isActive = true;
        else if (isActive === 'false') filters.isActive = false;

        if (types && typeof types === 'string') {
            filters.types = types.split(',').map(t => t.trim()).filter(Boolean);
        }

        const categories = await this.getShopCategoriesUseCase.execute(filters);

        res.status(200).json({
            status: 'success',
            data: { categories }
        });
    });

    createShopCategory = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.createShopCategoryUseCase.execute(req.body);

        res.status(201).json({
            status: 'success',
            data: { category }
        });
    });

    updateShopCategory = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const category = await this.updateShopCategoryUseCase.execute(id, req.body);

        res.status(200).json({
            status: 'success',
            data: { category }
        });
    });

    deleteShopCategory = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.deleteShopCategoryUseCase.execute(id);

        res.status(204).send();
    });

    uploadSampleImages = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ status: 'error', message: 'No images provided' });
            return;
        }

        const category = await this.shopCategoryRepository.findById(id);
        if (!category) {
            res.status(404).json({ status: 'error', message: 'Shop category not found' });
            return;
        }

        const uploaded = await this.fileUploadService.uploadImages(files, 'shop-categories');
        const newImages = uploaded.map(u => ({ url: u.url, publicId: u.publicId }));
        const allImages = [...(category.sampleImages || []), ...newImages];

        const updated = await this.shopCategoryRepository.update(id, { sampleImages: allImages } as any);

        res.status(200).json({
            status: 'success',
            data: { category: updated }
        });
    });

    deleteSampleImage = asyncHandler(async (req: Request, res: Response) => {
        const { id, publicId } = req.params;

        const decodedPublicId = decodeURIComponent(publicId);

        const category = await this.shopCategoryRepository.findById(id);
        if (!category) {
            res.status(404).json({ status: 'error', message: 'Shop category not found' });
            return;
        }

        await this.fileUploadService.deleteImage(decodedPublicId);
        const filtered = (category.sampleImages || []).filter(img => img.publicId !== decodedPublicId);
        const updated = await this.shopCategoryRepository.update(id, { sampleImages: filtered } as any);

        res.status(200).json({
            status: 'success',
            data: { category: updated }
        });
    });
}
