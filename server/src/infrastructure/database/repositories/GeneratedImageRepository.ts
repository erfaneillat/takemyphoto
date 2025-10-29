import { IGeneratedImageRepository } from '@core/domain/repositories/IGeneratedImageRepository';
import { GeneratedImage, CreateGeneratedImageDTO } from '@core/domain/entities/GeneratedImage';
import { GeneratedImageModel } from '../models/GeneratedImageModel';

export class GeneratedImageRepository implements IGeneratedImageRepository {
  async create(data: CreateGeneratedImageDTO): Promise<GeneratedImage> {
    const image = await GeneratedImageModel.create(data);
    return image.toJSON() as GeneratedImage;
  }

  async findById(id: string): Promise<GeneratedImage | null> {
    const image = await GeneratedImageModel.findById(id);
    return image ? (image.toJSON() as GeneratedImage) : null;
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<GeneratedImage[]> {
    const images = await GeneratedImageModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    return images.map(img => img.toJSON() as GeneratedImage);
  }

  async findByParentId(parentId: string): Promise<GeneratedImage[]> {
    const images = await GeneratedImageModel.find({ parentId }).sort({ createdAt: -1 });
    return images.map(img => img.toJSON() as GeneratedImage);
  }

  async delete(id: string): Promise<boolean> {
    const result = await GeneratedImageModel.findByIdAndDelete(id);
    return !!result;
  }

  async countByUserId(userId: string): Promise<number> {
    return await GeneratedImageModel.countDocuments({ userId });
  }

  async countByUserIdThisMonth(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await GeneratedImageModel.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth }
    });
  }
}
