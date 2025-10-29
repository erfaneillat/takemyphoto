import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { GeneratedImageEntity, CreateGeneratedImageDTO } from '@core/domain/entities/GeneratedImageEntity';
import { GeneratedImageEntityModel, GeneratedImageEntityDocument } from '../models/GeneratedImageEntityModel';

export class GeneratedImageEntityRepository implements IGeneratedImageEntityRepository {
  private toEntity(doc: GeneratedImageEntityDocument): GeneratedImageEntity {
    return {
      id: (doc._id as any).toString(),
      userId: doc.userId,
      taskId: doc.taskId,
      prompt: doc.prompt,
      type: doc.type,
      imageUrl: doc.imageUrl,
      originImageUrl: doc.originImageUrl,
      referenceImageUrls: doc.referenceImageUrls,
      characterIds: doc.characterIds,
      status: doc.status,
      error: doc.error,
      createdAt: doc.createdAt,
      completedAt: doc.completedAt
    };
  }

  async create(imageData: CreateGeneratedImageDTO): Promise<GeneratedImageEntity> {
    const image = new GeneratedImageEntityModel(imageData);
    const savedImage = await image.save();
    return this.toEntity(savedImage);
  }

  async findById(id: string): Promise<GeneratedImageEntity | null> {
    const image = await GeneratedImageEntityModel.findById(id);
    return image ? this.toEntity(image) : null;
  }

  async findByTaskId(taskId: string): Promise<GeneratedImageEntity | null> {
    const image = await GeneratedImageEntityModel.findOne({ taskId });
    return image ? this.toEntity(image) : null;
  }

  async findByUserId(userId: string, limit: number = 50, skip: number = 0): Promise<GeneratedImageEntity[]> {
    const images = await GeneratedImageEntityModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    return images.map(image => this.toEntity(image));
  }

  async update(id: string, updates: Partial<GeneratedImageEntity>): Promise<GeneratedImageEntity | null> {
    const image = await GeneratedImageEntityModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return image ? this.toEntity(image) : null;
  }

  async updateByTaskId(taskId: string, updates: Partial<GeneratedImageEntity>): Promise<GeneratedImageEntity | null> {
    const image = await GeneratedImageEntityModel.findOneAndUpdate(
      { taskId },
      { $set: updates },
      { new: true }
    );
    return image ? this.toEntity(image) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await GeneratedImageEntityModel.findByIdAndDelete(id);
    return !!result;
  }

  async countByUserId(userId: string): Promise<number> {
    return GeneratedImageEntityModel.countDocuments({ userId });
  }
}
