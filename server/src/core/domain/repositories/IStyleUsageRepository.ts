import { StyleUsage, CreateStyleUsageDTO, StyleUsageStats } from '../entities/StyleUsage';

export interface IStyleUsageRepository {
  create(data: CreateStyleUsageDTO): Promise<StyleUsage>;
  findByTemplateId(templateId: string, limit?: number): Promise<StyleUsage[]>;
  findByUserId(userId: string, limit?: number): Promise<StyleUsage[]>;
  countByTemplateId(templateId: string): Promise<number>;
  getPopularStyles(limit?: number, dateFrom?: Date): Promise<StyleUsageStats[]>;
  getMostUsedStylesByUser(userId: string, limit?: number): Promise<StyleUsageStats[]>;
}
