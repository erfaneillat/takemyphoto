import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UpscaleImageUseCase } from '../../application/usecases/upscale/UpscaleImageUseCase';
import multer from 'multer';

export class UpscaleController {
    constructor(private upscaleImageUseCase: UpscaleImageUseCase) { }

    /**
     * Upscale image endpoint
     */
    async upscaleImage(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { resolution } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'Image file is required'
                });
                return;
            }

            if (!resolution) {
                res.status(400).json({
                    success: false,
                    error: 'Resolution parameter is required'
                });
                return;
            }

            // Normalize and validate resolution label
            const normalized = String(resolution).trim().toUpperCase();
            const validLabels = new Set(['1K', '2K', '4K']);
            if (!validLabels.has(normalized)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid resolution. Must be one of: 1K, 2K, 4K`
                });
                return;
            }

            // Check file size (max 10MB)
            if (req.file.size > 10 * 1024 * 1024) {
                res.status(400).json({
                    success: false,
                    error: 'File size must be less than 10MB'
                });
                return;
            }

            // Check file type
            if (!req.file.mimetype.startsWith('image/')) {
                res.status(400).json({
                    success: false,
                    error: 'File must be an image'
                });
                return;
            }

            console.log('🚀 Upscale request:', {
                userId,
                resolutionLabel: normalized,
                originalName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            });

            const result = await this.upscaleImageUseCase.execute({
                imageBuffer: req.file.buffer,
                originalName: req.file.originalname,
                resolution: normalized,
                userId
            });

            res.status(200).json({
                success: true,
                message: 'Image upscaled successfully',
                imageUrl: result.imageUrl,
                originalResolution: result.originalResolution,
                targetResolution: result.targetResolution
            });

        } catch (error) {
            console.error('Upscale controller error:', error);

            const message = error instanceof Error ? error.message : 'Unknown error occurred';

            res.status(500).json({
                success: false,
                error: `Failed to upscale image: ${message}`
            });
        }
    }
}

// Multer configuration for image upload
export const upscaleUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
