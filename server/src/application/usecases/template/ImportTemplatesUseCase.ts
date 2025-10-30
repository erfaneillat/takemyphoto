import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { ICategoryRepository } from '@core/domain/repositories/ICategoryRepository';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface ImportTemplateItem {
  title: string;
  fullPrompt: string;
  imageUrl: string;
  categories: string[];
}

export interface ImportResult {
  success: number;
  skipped: number;
  failed: number;
  details: {
    imported: string[];
    skipped: Array<{ title: string; reason: string }>;
    failed: Array<{ title: string; error: string }>;
  };
}

export class ImportTemplatesUseCase {
  private uploadsDir: string;

  constructor(
    private templateRepository: ITemplateRepository,
    private categoryRepository: ICategoryRepository
  ) {
    this.uploadsDir = path.resolve(__dirname, '../../../../../uploads');
  }

  async execute(items: ImportTemplateItem[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      skipped: 0,
      failed: 0,
      details: {
        imported: [],
        skipped: [],
        failed: []
      }
    };

    for (const item of items) {
      try {
        // Skip if prompt is empty
        if (!item.fullPrompt || item.fullPrompt.trim() === '') {
          result.skipped++;
          result.details.skipped.push({
            title: item.title,
            reason: 'Empty prompt'
          });
          continue;
        }

        // Skip if no image URL
        if (!item.imageUrl) {
          result.skipped++;
          result.details.skipped.push({
            title: item.title,
            reason: 'No image URL'
          });
          continue;
        }

        // Download and save image
        const imageResult = await this.downloadAndSaveImage(item.imageUrl, item.title);
        if (!imageResult) {
          result.skipped++;
          result.details.skipped.push({
            title: item.title,
            reason: 'Image download failed'
          });
          continue;
        }

        // Handle categories - use first category or default
        let categorySlug = 'general';
        if (item.categories && item.categories.length > 0) {
          const categoryName = item.categories[0];
          const category = await this.findOrCreateCategory(categoryName);
          if (category) {
            categorySlug = category.slug;
          }
        }

        // Create template
        await this.templateRepository.create({
          imageUrl: imageResult.url,
          publicId: imageResult.publicId,
          prompt: item.fullPrompt,
          style: item.title,
          category: categorySlug,
          tags: item.categories || []
        });

        result.success++;
        result.details.imported.push(item.title);
      } catch (error) {
        result.failed++;
        result.details.failed.push({
          title: item.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  private async downloadAndSaveImage(
    imageUrl: string,
    title: string
  ): Promise<{ url: string; publicId: string } | null> {
    try {
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // Create folder structure
      const folder = 'nero/templates';
      const folderPath = path.join(this.uploadsDir, folder);
      
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate filename
      const sanitizedTitle = title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const ext = path.extname(new URL(imageUrl).pathname) || '.png';
      const filename = `${sanitizedTitle}-${fileId}${ext}`;
      const filepath = path.join(folderPath, filename);

      // Save file
      fs.writeFileSync(filepath, Buffer.from(response.data));

      const url = `/uploads/${folder}/${filename}`;
      const publicId = `${folder}/${filename}`;

      return { url, publicId };
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  }

  private async findOrCreateCategory(categoryName: string): Promise<{ slug: string } | null> {
    try {
      // Create slug from name
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Try to find existing category
      const existing = await this.categoryRepository.findBySlug(slug);
      if (existing) {
        return existing;
      }

      // Create new category
      const category = await this.categoryRepository.create({
        name: categoryName,
        slug: slug,
        order: 999
      });

      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }
}
