import { Request, Response } from 'express';
import { CreateShopUseCase } from '@application/usecases/shop/CreateShopUseCase';
import { GetShopsUseCase } from '@application/usecases/shop/GetShopsUseCase';
import { DeleteShopUseCase } from '@application/usecases/shop/DeleteShopUseCase';
import { ActivateLicenseUseCase } from '@application/usecases/shop/ActivateLicenseUseCase';
import { ValidateLicenseUseCase } from '@application/usecases/shop/ValidateLicenseUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class ShopController {
    constructor(
        private createShopUseCase: CreateShopUseCase,
        private getShopsUseCase: GetShopsUseCase,
        private deleteShopUseCase: DeleteShopUseCase,
        private activateLicenseUseCase: ActivateLicenseUseCase,
        private validateLicenseUseCase: ValidateLicenseUseCase
    ) { }

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
                    generationCount: shop.generationCount,
                }
            }
        });
    });

    createShop = asyncHandler(async (req: Request, res: Response) => {
        const { name, description, types, licenseDurationMonths, credit } = req.body;

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

        const shop = await this.createShopUseCase.execute({ name, description, types, licenseDurationMonths: duration, credit: parseInt(credit) || 0 });

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
        const { name, description, types, licenseDurationMonths, credit } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (types !== undefined) updateData.types = types;
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
                        generationCount: shop.generationCount,
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
                        generationCount: shop.generationCount,
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
}
