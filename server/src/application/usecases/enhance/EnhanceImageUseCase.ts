import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

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
  async execute(request: EnhanceImageRequest): Promise<EnhanceImageResponse> {
    const { imageFile, options, userId } = request;

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

    return {
      url,
      width,
      height
    };
  }
}
