import { GeneratedImageEntity, CreateGeneratedImageDTO } from '../entities/GeneratedImageEntity';

export interface IGeneratedImageEntityRepository {
  create(imageData: CreateGeneratedImageDTO): Promise<GeneratedImageEntity>;
  findById(id: string): Promise<GeneratedImageEntity | null>;
  findByTaskId(taskId: string): Promise<GeneratedImageEntity | null>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<GeneratedImageEntity[]>;
  findAll(limit?: number, skip?: number): Promise<GeneratedImageEntity[]>;
  update(id: string, updates: Partial<GeneratedImageEntity>): Promise<GeneratedImageEntity | null>;
  updateByTaskId(taskId: string, updates: Partial<GeneratedImageEntity>): Promise<GeneratedImageEntity | null>;
  delete(id: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
  countAll(): Promise<number>;
}
