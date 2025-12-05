import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { AppError } from '@presentation/middleware/errorHandler';

// Helper function to calculate star cost based on scale
function getStarCost(scale: number): number {
  // 2x = 10 stars, 4x = 20 stars
  return scale >= 4 ? 20 : 10;
}

export interface UpscaleImageRequest {
  imageFile: Express.Multer.File;
  scale: number; // 2x, 4x, etc.
  userId: string;
}

export interface UpscaleImageResponse {
  url: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export class UpscaleImageUseCase {
  constructor(
    private userRepository: IUserRepository
  ) { }

  async execute(request: UpscaleImageRequest): Promise<UpscaleImageResponse> {
    const { imageFile, scale, userId } = request;

    // Check user's star balance (all users pay stars now)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const starCost = getStarCost(scale);
    if (user.stars < starCost) {
      throw new AppError(403, `INSUFFICIENT_STARS: You need ${starCost} stars for ${scale}x upscale. You have ${user.stars} stars. Please upgrade your subscription to get more stars.`);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'enhanced', userId);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Get original image metadata (respect EXIF orientation)
    const pipeline = sharp(imageFile.buffer).rotate();
    const metadata = await pipeline.metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate new dimensions
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const inputExt = (path.extname(imageFile.originalname) || '.jpg').toLowerCase();
    let outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';
    if (inputExt === '.png') outputFormat = 'png';
    else if (inputExt === '.webp') outputFormat = 'webp';
    const extForName = outputFormat === 'jpeg' ? '.jpg' : `.${outputFormat}`;
    const filename = `upscaled-${timestamp}-${randomStr}${extForName}`;
    const filepath = path.join(uploadsDir, filename);

    // Upscale image using Lanczos3 resampling (high quality) + mild sharpening
    const processed = pipeline
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      .sharpen()
      .withMetadata();

    if (outputFormat === 'jpeg') {
      await processed
        .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: '4:4:4' })
        .toFile(filepath);
    } else if (outputFormat === 'png') {
      await processed
        .png({ compressionLevel: 9 })
        .toFile(filepath);
    } else {
      await processed
        .webp({ quality: 95 })
        .toFile(filepath);
    }

    const url = `/uploads/enhanced/${userId}/${filename}`;

    // Deduct stars AFTER successful upscale
    await this.userRepository.decrementStars(userId, starCost);
    console.log(`⭐ User ${userId} consumed ${starCost} stars for ${scale}x upscale. Remaining: ${user.stars - starCost}`);

    return {
      url,
      width: newWidth,
      height: newHeight,
      originalWidth,
      originalHeight
    };
  }
}
