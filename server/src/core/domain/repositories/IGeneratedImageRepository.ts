import { GeneratedImage, CreateGeneratedImageDTO } from '../entities/GeneratedImage';

export interface IGeneratedImageRepository {
  create(data: CreateGeneratedImageDTO): Promise<GeneratedImage>;
  findById(id: string): Promise<GeneratedImage | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<GeneratedImage[]>;
  findByParentId(parentId: string): Promise<GeneratedImage[]>;
  delete(id: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
  countByUserIdThisMonth(userId: string): Promise<number>;
}
