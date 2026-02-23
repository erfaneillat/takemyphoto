import { Request, Response } from 'express';
import { CreateShopUseCase } from '@application/usecases/shop/CreateShopUseCase';
import { GetShopsUseCase } from '@application/usecases/shop/GetShopsUseCase';
import { DeleteShopUseCase } from '@application/usecases/shop/DeleteShopUseCase';
import { ActivateLicenseUseCase } from '@application/usecases/shop/ActivateLicenseUseCase';
import { ValidateLicenseUseCase } from '@application/usecases/shop/ValidateLicenseUseCase';
import { RegenerateShopLicenseUseCase } from '@application/usecases/shop/RegenerateShopLicenseUseCase';
import { IFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { asyncHandler } from '../middleware/errorHandler';

export class ShopController {
    constructor(
        private createShopUseCase: CreateShopUseCase,
        private getShopsUseCase: GetShopsUseCase,
        private deleteShopUseCase: DeleteShopUseCase,
        private activateLicenseUseCase: ActivateLicenseUseCase,
        private validateLicenseUseCase: ValidateLicenseUseCase,
        private regenerateShopLicenseUseCase: RegenerateShopLicenseUseCase,
        private fileUploadService: IFileUploadService
    ) { }

    getManifest = asyncHandler(async (req: Request, res: Response) => {
        const { licenseKey } = req.params;

        if (!licenseKey) {
            return res.status(400).json({ status: 'error', message: 'License key is required' });
        }

        const shopRepository = (this.activateLicenseUseCase as any).shopRepository;
        const shop = await shopRepository.findByLicenseKey(licenseKey.toUpperCase());

        if (!shop) {
            return res.status(404).json({ status: 'error', message: 'Shop not found' });
        }

        const logoSrc = shop.logoWithBg || '/logo.png';

        const manifest = {
            short_name: shop.name || 'Zhest',
            name: shop.name || 'Zhest',
            start_url: '/?source=pwa',
            display: 'standalone',
            theme_color: '#000000',
            background_color: '#ffffff',
            icons: [
                {
                    src: logoSrc,
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'
                },
                {
                    src: logoSrc,
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        };

        // Important: return application/manifest+json content type
        res.setHeader('Content-Type', 'application/manifest+json');
        return res.status(200).send(JSON.stringify(manifest));
    });

    getShopInfo = asyncHandler(async (req: Request, res: Response) => {
        const { licenseKey } = req.query;

        if (!licenseKey) {
            return res.status(400).json({
                status: 'error',
                message: 'License key is required'
            });
        }

        const shopRepository = (this.createShopUseCase as any).shopRepository;
        const shop = await shopRepository.findByLicenseKey((licenseKey as string).toUpperCase());

        if (!shop) {
            return res.status(404).json({
                status: 'error',
                message: 'Shop not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                shop: {
                    id: shop.id,
                    name: shop.name,
                    description: shop.description,
                    types: shop.types,
                    isActivated: shop.isActivated,
                    licenseExpiresAt: shop.licenseExpiresAt,
                    credit: shop.credit,
                    logoWithBg: shop.logoWithBg,
                    logoWithoutBg: shop.logoWithoutBg,
                    generationCount: shop.generationCount,
                    phoneNumber: shop.phoneNumber,
                    address: shop.address,
                    ownerName: shop.ownerName,
                }
            }
        });
    });

    createShop = asyncHandler(async (req: Request, res: Response) => {
        const { name, description, types, licenseDurationMonths, credit, phoneNumber, address, ownerName } = req.body;

        if (!name || !types || !Array.isArray(types) || types.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Name and at least one shop type are required'
            });
        }

        const duration = parseInt(licenseDurationMonths) || 1;
        if (duration < 1 || duration > 120) {
            return res.status(400).json({
                status: 'error',
                message: 'License duration must be between 1 and 120 months'
            });
        }

        const shop = await this.createShopUseCase.execute({
            name,
            description,
            types,
            licenseDurationMonths: duration,
            credit: parseInt(credit) || 0,
            phoneNumber,
            address,
            ownerName
        });

        return res.status(201).json({
            status: 'success',
            data: { shop }
        });
    });

    getShops = asyncHandler(async (_req: Request, res: Response) => {
        const shops = await this.getShopsUseCase.execute();

        return res.status(200).json({
            status: 'success',
            data: { shops }
        });
    });

    deleteShop = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const deleted = await this.deleteShopUseCase.execute(id);

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Shop not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Shop deleted successfully'
        });
    });

    updateShop = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, types, licenseDurationMonths, credit, phoneNumber, address, ownerName } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (types !== undefined) updateData.types = types;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (address !== undefined) updateData.address = address;
        if (ownerName !== undefined) updateData.ownerName = ownerName;
        if (credit !== undefined) {
            const c = parseInt(credit);
            if (isNaN(c) || c < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Credit must be a non-negative number'
                });
            }
            updateData.credit = c;
        }
        if (licenseDurationMonths !== undefined) {
            const duration = parseInt(licenseDurationMonths);
            if (!duration || duration < 1 || duration > 120) {
                return res.status(400).json({
                    status: 'error',
                    message: 'License duration must be between 1 and 120 months'
                });
            }
            updateData.licenseDurationMonths = duration;
        }

        const shopRepository = (this.createShopUseCase as any).shopRepository;
        const updated = await shopRepository.update(id, updateData);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Shop not found'
            });
        }

        // If duration was changed and shop was already activated, recompute expiry
        if (updateData.licenseDurationMonths && updated.activatedAt) {
            const expiry = new Date(updated.activatedAt);
            expiry.setMonth(expiry.getMonth() + updateData.licenseDurationMonths);
            const reUpdated = await shopRepository.update(id, { licenseExpiresAt: expiry });
            return res.status(200).json({
                status: 'success',
                data: { shop: reUpdated }
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { shop: updated }
        });
    });

    uploadLogos = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!files) {
            return res.status(400).json({ status: 'error', message: 'No files uploaded' });
        }

        const shopRepository = (this.createShopUseCase as any).shopRepository;
        const shop = await shopRepository.findById(id);

        if (!shop) {
            return res.status(404).json({ status: 'error', message: 'Shop not found' });
        }

        const updateData: any = {};

        if (files.logoWithBg?.[0]) {
            const uploaded = await this.fileUploadService.uploadImage(files.logoWithBg[0], 'shops/logos');
            updateData.logoWithBg = uploaded.url;
        }

        if (files.logoWithoutBg?.[0]) {
            const uploaded = await this.fileUploadService.uploadImage(files.logoWithoutBg[0], 'shops/logos');
            updateData.logoWithoutBg = uploaded.url;
        }

        if (Object.keys(updateData).length > 0) {
            const updated = await shopRepository.update(id, updateData);
            return res.status(200).json({ status: 'success', data: { shop: updated } });
        }

        return res.status(400).json({ status: 'error', message: 'No valid logo files provided' });
    });

    activateLicense = asyncHandler(async (req: Request, res: Response) => {
        const { licenseKey, deviceFingerprint } = req.body;

        if (!licenseKey || !deviceFingerprint) {
            return res.status(400).json({
                status: 'error',
                message: 'License key and device fingerprint are required'
            });
        }

        try {
            const shop = await this.activateLicenseUseCase.execute({
                licenseKey: licenseKey.toUpperCase(),
                deviceFingerprint
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    shop: {
                        id: shop.id,
                        name: shop.name,
                        description: shop.description,
                        types: shop.types,
                        isActivated: shop.isActivated,
                        licenseExpiresAt: shop.licenseExpiresAt,
                        credit: shop.credit,
                        logoWithBg: shop.logoWithBg,
                        logoWithoutBg: shop.logoWithoutBg,
                        generationCount: shop.generationCount,
                        phoneNumber: shop.phoneNumber,
                        address: shop.address,
                        ownerName: shop.ownerName,
                    }
                }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Activation failed';
            return res.status(400).json({
                status: 'error',
                message
            });
        }
    });

    validateLicense = asyncHandler(async (req: Request, res: Response) => {
        const { licenseKey, deviceFingerprint } = req.body;

        if (!licenseKey || !deviceFingerprint) {
            return res.status(400).json({
                status: 'error',
                message: 'License key and device fingerprint are required'
            });
        }

        try {
            const shop = await this.validateLicenseUseCase.execute(
                licenseKey.toUpperCase(),
                deviceFingerprint
            );

            return res.status(200).json({
                status: 'success',
                data: {
                    shop: {
                        id: shop.id,
                        name: shop.name,
                        description: shop.description,
                        types: shop.types,
                        isActivated: shop.isActivated,
                        licenseExpiresAt: shop.licenseExpiresAt,
                        credit: shop.credit,
                        logoWithBg: shop.logoWithBg,
                        logoWithoutBg: shop.logoWithoutBg,
                        generationCount: shop.generationCount,
                        phoneNumber: shop.phoneNumber,
                        address: shop.address,
                        ownerName: shop.ownerName,
                    }
                }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Validation failed';
            return res.status(400).json({
                status: 'error',
                message
            });
        }
    });

    regenerateLicense = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const shop = await this.regenerateShopLicenseUseCase.execute(id);
            if (!shop) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Shop not found'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: { shop }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Regeneration failed';
            return res.status(400).json({
                status: 'error',
                message
            });
        }
    });
}
