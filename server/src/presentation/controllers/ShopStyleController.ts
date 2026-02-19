import { Request, Response } from 'express';
import { CreateShopStyleUseCase } from '@application/usecases/shop-style/CreateShopStyleUseCase';
import { GetShopStylesUseCase } from '@application/usecases/shop-style/GetShopStylesUseCase';
import { UpdateShopStyleUseCase } from '@application/usecases/shop-style/UpdateShopStyleUseCase';
import { DeleteShopStyleUseCase } from '@application/usecases/shop-style/DeleteShopStyleUseCase';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { IShopStyleRepository } from '@core/domain/repositories/IShopStyleRepository';
import { ShopType } from '@core/domain/entities/Shop';
import { CreateShopStyleDTO } from '@core/domain/entities/ShopStyle';
import { asyncHandler } from '../middleware/errorHandler';

const DEFAULT_STYLES: (CreateShopStyleDTO & { thumbnailUrl: string })[] = [
    {
        name: 'پینترست', slug: 'pinterest', description: 'ترکیب فلت‌لی و لایف‌استایل',
        types: Object.values(ShopType), order: 0,
        thumbnailUrl: '/product-styles/pinterest.png',
        prompt: `Pinterest-worthy product photography combining flat lay and lifestyle elements. Highly aesthetic, save-worthy composition. Warm, inviting color palette. Curated props that enhance the mood. Natural light feel, soft shadows. Aspirational yet achievable lifestyle. Perfect for mood boards and inspiration.`
    },
    {
        name: 'فروشگاهی', slug: 'ecommerce', description: 'پس‌زمینه سفید، حرفه‌ای',
        types: Object.values(ShopType), order: 1,
        thumbnailUrl: '/product-styles/shop.png',
        prompt: `Professional e-commerce product photography style. Pure white seamless background (#FFFFFF). Soft, even studio lighting with no harsh shadows. Product is the sole focus, perfectly centered. Clean, commercial look suitable for Amazon, Shopify, or marketplace listings. High-key lighting, crisp details, professional product isolation.`
    },
    {
        name: 'لایف‌استایل', slug: 'lifestyle', description: 'محیط طبیعی و واقعی',
        types: Object.values(ShopType), order: 2,
        thumbnailUrl: '/product-styles/lifestyle.png',
        prompt: `Lifestyle product photography style. The product is shown in a natural, real-world setting. Warm, inviting atmosphere with contextual props. The scene tells a story of product usage. Soft natural lighting, possibly from a window. Lifestyle props complement but don't overshadow the product. Magazine-quality editorial feel, aspirational yet relatable.`
    },
    {
        name: 'فلت‌لی', slug: 'flatlay', description: 'نمای بالا، چیدمان زیبا',
        types: Object.values(ShopType), order: 3,
        thumbnailUrl: '/product-styles/flatli.jpeg',
        prompt: `Flat lay photography style, shot directly from above (90-degree angle). Carefully arranged items on a clean surface. Pinterest-worthy aesthetic composition. Complementary props artfully scattered around the main product. Perfect symmetry or intentional asymmetry. Instagram-ready, shareable, visually satisfying arrangement with breathing room between items.`
    },
    {
        name: 'مینیمال', slug: 'minimal', description: 'ساده، شیک و لاکچری',
        types: Object.values(ShopType), order: 4,
        thumbnailUrl: '/product-styles/minimal.png',
        prompt: `Minimalist product photography style. Clean, uncluttered composition with maximum negative space. Simple solid color background (white, beige, light gray, or soft pastels). 1-2 subtle accent elements only. Elegant, premium, luxury brand aesthetic. Less is more approach, sophisticated and refined, Scandinavian design influence.`
    },
    {
        name: 'رنگی', slug: 'colorblock', description: 'رنگ‌های پرانرژی و جذاب',
        types: Object.values(ShopType), order: 5,
        thumbnailUrl: '/product-styles/colored.png',
        prompt: `Bold color block product photography style. Vibrant, saturated background colors. Eye-catching contrast between product and background. Pop art influence, energetic and youthful. May use complementary or contrasting color schemes. Perfect for social media, ads, and Gen-Z targeting. High impact visual, attention-grabbing, trendy aesthetic.`
    },
    {
        name: 'دراماتیک', slug: 'moody', description: 'تاریک و سینمایی',
        types: Object.values(ShopType), order: 6,
        thumbnailUrl: '/product-styles/moody.png',
        prompt: `Moody, dark product photography style. Deep shadows and dramatic directional lighting. Dark background (black, charcoal, deep navy). High contrast, cinematic feel. Chiaroscuro lighting technique. Premium, luxury, mysterious atmosphere. Perfect for high-end products, watches, perfumes, whiskey, leather goods.`
    },
    {
        name: 'ماکرو', slug: 'macro', description: 'جزئیات و بافت محصول',
        types: Object.values(ShopType), order: 7,
        thumbnailUrl: '/product-styles/micro.png',
        prompt: `Macro/detail product photography style. Extreme close-up focusing on textures and details. Sharp focus on specific product features (stitching, materials, logos, craftsmanship). Shows quality and attention to detail. Partially visible product creating intrigue. Technical precision, showcasing build quality and premium materials.`
    },
    {
        name: 'اینفوگرافیک', slug: 'infographic', description: 'همراه با توضیحات متنی',
        types: Object.values(ShopType), order: 8,
        thumbnailUrl: '/product-styles/infography.png',
        prompt: `Product infographic style photography. Clean product image with text overlays showing product features. Add callouts, arrows, and feature descriptions directly on the image. Clear, organized layout. Multiple angles or features highlighted. Educational and informative approach. IMPORTANT: Any text on the image MUST be in the SAME LANGUAGE as the product name provided by the user. If product name is in Persian/Farsi, all text overlays must be in Persian/Farsi. If product name is in English, all text overlays must be in English. Perfect for Amazon listings, product pages, and advertising banners.`
    },
    {
        name: 'محتوای کاربری', slug: 'ugc', description: 'طبیعی و خودمانی',
        types: Object.values(ShopType), order: 9,
        thumbnailUrl: '/product-styles/ugc.png',
        prompt: `User-generated content (UGC) style product photography. Authentic, slightly casual mobile photography feel. Natural, unpolished but appealing. Real person's perspective, relatable setting. Not overly staged or perfect. Social proof aesthetic, trustworthy and genuine. Instagram story quality, casual lifestyle integration.`
    },
];

export class ShopStyleController {
    constructor(
        private createShopStyleUseCase: CreateShopStyleUseCase,
        private getShopStylesUseCase: GetShopStylesUseCase,
        private updateShopStyleUseCase: UpdateShopStyleUseCase,
        private deleteShopStyleUseCase: DeleteShopStyleUseCase,
        private fileUploadService: IFileUploadService,
        private shopStyleRepository: IShopStyleRepository
    ) { }

    getShopStyles = asyncHandler(async (req: Request, res: Response) => {
        const { isActive, types } = req.query;

        const filters: { isActive?: boolean; types?: string[] } = {};

        if (isActive === 'true') filters.isActive = true;
        else if (isActive === 'false') filters.isActive = false;

        if (types && typeof types === 'string') {
            filters.types = types.split(',').map(t => t.trim()).filter(Boolean);
        }

        const styles = await this.getShopStylesUseCase.execute(filters);

        res.status(200).json({
            status: 'success',
            data: { styles }
        });
    });

    createShopStyle = asyncHandler(async (req: Request, res: Response) => {
        const style = await this.createShopStyleUseCase.execute(req.body);

        res.status(201).json({
            status: 'success',
            data: { style }
        });
    });

    updateShopStyle = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const style = await this.updateShopStyleUseCase.execute(id, req.body);

        res.status(200).json({
            status: 'success',
            data: { style }
        });
    });

    deleteShopStyle = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.deleteShopStyleUseCase.execute(id);

        res.status(204).send();
    });

    seedDefaults = asyncHandler(async (_req: Request, res: Response) => {
        let created = 0;
        let skipped = 0;

        for (const styleData of DEFAULT_STYLES) {
            const exists = await this.shopStyleRepository.exists(styleData.slug);
            if (exists) {
                skipped++;
                continue;
            }
            const { thumbnailUrl, ...createData } = styleData;
            const created_style = await this.shopStyleRepository.create(createData);
            if (thumbnailUrl) {
                await this.shopStyleRepository.update(created_style.id, { thumbnailUrl });
            }
            created++;
        }

        const styles = await this.getShopStylesUseCase.execute();

        res.status(200).json({
            status: 'success',
            data: { created, skipped, styles }
        });
    });

    uploadThumbnail = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const file = req.file as Express.Multer.File;

        if (!file) {
            res.status(400).json({ status: 'error', message: 'No image provided' });
            return;
        }

        const style = await this.shopStyleRepository.findById(id);
        if (!style) {
            res.status(404).json({ status: 'error', message: 'Shop style not found' });
            return;
        }

        // Delete old thumbnail if exists
        if (style.thumbnailUrl) {
            try {
                const oldPublicId = style.thumbnailUrl.split('/uploads/')[1];
                if (oldPublicId) {
                    await this.fileUploadService.deleteImage(oldPublicId);
                }
            } catch (err) {
                console.error('Failed to delete old thumbnail:', err);
            }
        }

        const uploaded = await this.fileUploadService.uploadImage(file, 'shop-styles');

        const updated = await this.shopStyleRepository.update(id, { thumbnailUrl: uploaded.url });

        res.status(200).json({
            status: 'success',
            data: { style: updated }
        });
    });

    deleteThumbnail = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const style = await this.shopStyleRepository.findById(id);
        if (!style) {
            res.status(404).json({ status: 'error', message: 'Shop style not found' });
            return;
        }

        if (style.thumbnailUrl) {
            try {
                const publicId = style.thumbnailUrl.split('/uploads/')[1];
                if (publicId) {
                    await this.fileUploadService.deleteImage(publicId);
                }
            } catch (err) {
                console.error('Failed to delete thumbnail:', err);
            }
        }

        const updated = await this.shopStyleRepository.update(id, { thumbnailUrl: undefined } as any);

        res.status(200).json({
            status: 'success',
            data: { style: updated }
        });
    });
}
