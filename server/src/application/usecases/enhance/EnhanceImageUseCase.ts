import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { AppError } from '@presentation/middleware/errorHandler';

// Star cost for enhance is flat 10 stars
const ENHANCE_STAR_COST = 10;

export interface EnhanceImageRequest {
  imageFile: Express.Multer.File;
  options: {
    upscale?: boolean;
    denoise?: boolean;
    enhanceColors?: boolean;
    sharpen?: boolean;
    autoFix?: boolean;
  };
  userId: string;
}

export interface EnhanceImageResponse {
  url: string;
  width: number;
  height: number;
}

export class EnhanceImageUseCase {
  constructor(
    private userRepository: IUserRepository
  ) { }

  async execute(request: EnhanceImageRequest): Promise<EnhanceImageResponse> {
    const { imageFile, options, userId } = request;

    // Check user's star balance (all users pay stars now)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.stars < ENHANCE_STAR_COST) {
      throw new AppError(403, `INSUFFICIENT_STARS: You need ${ENHANCE_STAR_COST} stars for image enhancement. You have ${user.stars} stars. Please upgrade your subscription to get more stars.`);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'enhanced', userId);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Start with the image buffer
    let image = sharp(imageFile.buffer);

    // Apply auto fix (normalize colors, adjust levels)
    if (options.autoFix) {
      image = image.normalize();
    }

    // Get metadata for upscaling
    const metadata = await image.metadata();
    let width = metadata.width || 0;
    let height = metadata.height || 0;

    // Apply upscaling (2x)
    if (options.upscale) {
      width *= 2;
      height *= 2;
      image = image.resize(width, height, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      });
    }

    // Apply sharpening
    if (options.sharpen) {
      image = image.sharpen({
        sigma: 1.5,
        m1: 1.0,
        m2: 0.5,
        x1: 3,
        y2: 15,
        y3: 15
      });
    }

    // Enhance colors (increase saturation)
    if (options.enhanceColors) {
      image = image.modulate({
        saturation: 1.3, // 30% more saturation
        brightness: 1.05 // 5% brighter
      });
    }

    // Apply denoising (median filter)
    if (options.denoise) {
      image = image.median(3);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(imageFile.originalname) || '.jpg';
    const filename = `enhanced-${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Save enhanced image
    await image
      .jpeg({ quality: 95 })
      .toFile(filepath);

    const url = `/uploads/enhanced/${userId}/${filename}`;

    // Deduct stars AFTER successful enhancement
    await this.userRepository.decrementStars(userId, ENHANCE_STAR_COST);
    console.log(`⭐ User ${userId} consumed ${ENHANCE_STAR_COST} stars for image enhancement. Remaining: ${user.stars - ENHANCE_STAR_COST}`);

    return {
      url,
      width,
      height
    };
  }
}
