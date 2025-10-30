import { TemplateModel } from '@infrastructure/database/models/TemplateModel';
import { Template } from '@core/domain/entities/Template';

export interface PopularStylesRequest {
  limit?: number;
  period?: 'all' | 'month' | 'week';
  offset?: number;
  category?: string;
}

export class GetPopularStylesUseCase {
  async execute(request: PopularStylesRequest = {}): Promise<Template[]> {
    const { limit = 10, period = 'all', offset = 0, category } = request;

    // Calculate date filter based on period
    let dateFilter: any = {};
    if (period !== 'all') {
      const now = new Date();
      const daysAgo = period === 'week' ? 7 : 30;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: startDate } };
    }
    const query = { ...dateFilter, ...(category ? { category } : {}) } as any;

    // Get templates sorted by usage count
    const templates = await TemplateModel
      .find(query)
      .sort({ usageCount: -1, likeCount: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return templates.map(template => ({
      id: template._id.toString(),
      imageUrl: template.imageUrl,
      publicId: template.publicId,
      prompt: template.prompt,
      style: template.style,
      category: template.category,
      tags: template.tags,
      isTrending: template.isTrending,
      viewCount: template.viewCount,
      likeCount: template.likeCount,
      usageCount: template.usageCount || 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }
}
