import { Template, CreateTemplateDTO, UpdateTemplateDTO } from '../entities/Template';

export interface ITemplateRepository {
  create(data: CreateTemplateDTO): Promise<Template>;
  findById(id: string): Promise<Template | null>;
  findByIds(ids: string[]): Promise<Template[]>;
  findAll(limit?: number, offset?: number): Promise<Template[]>;
  findByCategory(category: string, limit?: number, offset?: number): Promise<Template[]>;
  findTrending(limit?: number, period?: 'week' | 'month'): Promise<Template[]>;
  search(query: string, limit?: number, offset?: number): Promise<Template[]>;
  update(id: string, data: UpdateTemplateDTO): Promise<Template | null>;
  delete(id: string): Promise<boolean>;
  incrementViewCount(id: string): Promise<void>;
  incrementLikeCount(id: string): Promise<void>;
  decrementLikeCount(id: string): Promise<void>;
  updateLikeCount(id: string, count: number): Promise<void>;
  updateUsageCount(id: string, count: number): Promise<void>;
}
