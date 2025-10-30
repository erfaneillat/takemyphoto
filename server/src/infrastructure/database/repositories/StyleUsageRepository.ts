import { IStyleUsageRepository } from '@core/domain/repositories/IStyleUsageRepository';
import { StyleUsage, CreateStyleUsageDTO, StyleUsageStats } from '@core/domain/entities/StyleUsage';
import { StyleUsageModel } from '../models/StyleUsageModel';
import { TemplateModel } from '../models/TemplateModel';

export class StyleUsageRepository implements IStyleUsageRepository {
  async create(data: CreateStyleUsageDTO): Promise<StyleUsage> {
    const styleUsage = await StyleUsageModel.create(data);
    return this.mapToEntity(styleUsage);
  }

  async findByTemplateId(templateId: string, limit: number = 50): Promise<StyleUsage[]> {
    const usages = await StyleUsageModel
      .find({ templateId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return usages.map(this.mapToEntity);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<StyleUsage[]> {
    const usages = await StyleUsageModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return usages.map(this.mapToEntity);
  }

  async countByTemplateId(templateId: string): Promise<number> {
    return await StyleUsageModel.countDocuments({ templateId });
  }

  async getPopularStyles(limit: number = 10, dateFrom?: Date): Promise<StyleUsageStats[]> {
    const matchStage: any = {};
    if (dateFrom) {
      matchStage.createdAt = { $gte: dateFrom };
    }

    const pipeline: any[] = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$templateId',
          usageCount: { $sum: 1 },
          lastUsedAt: { $max: '$createdAt' }
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: limit }
    ];

    const results = await StyleUsageModel.aggregate(pipeline);

    // Enrich with template data
    const enriched = await Promise.all(
      results.map(async (item) => {
        const template = await TemplateModel.findById(item._id).lean();
        return {
          templateId: item._id,
          templateName: template?.prompt || 'Unknown Style',
          templateImageUrl: template?.imageUrl,
          usageCount: item.usageCount,
          lastUsedAt: item.lastUsedAt
        };
      })
    );

    return enriched;
  }

  async getMostUsedStylesByUser(userId: string, limit: number = 10): Promise<StyleUsageStats[]> {
    const pipeline: any[] = [
      { $match: { userId } },
      {
        $group: {
          _id: '$templateId',
          usageCount: { $sum: 1 },
          lastUsedAt: { $max: '$createdAt' }
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: limit }
    ];

    const results = await StyleUsageModel.aggregate(pipeline);

    // Enrich with template data
    const enriched = await Promise.all(
      results.map(async (item) => {
        const template = await TemplateModel.findById(item._id).lean();
        return {
          templateId: item._id,
          templateName: template?.prompt || 'Unknown Style',
          templateImageUrl: template?.imageUrl,
          usageCount: item.usageCount,
          lastUsedAt: item.lastUsedAt
        };
      })
    );

    return enriched;
  }

  private mapToEntity(doc: any): StyleUsage {
    return {
      id: doc._id.toString(),
      templateId: doc.templateId,
      userId: doc.userId,
      generatedImageId: doc.generatedImageId,
      createdAt: doc.createdAt,
    };
  }
}
