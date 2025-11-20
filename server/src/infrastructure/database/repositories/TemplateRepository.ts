import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { Template, CreateTemplateDTO, UpdateTemplateDTO } from '@core/domain/entities/Template';
import { TemplateModel } from '../models/TemplateModel';

export class TemplateRepository implements ITemplateRepository {
  async create(data: CreateTemplateDTO): Promise<Template> {
    const template = await TemplateModel.create(data);
    return template.toJSON() as Template;
  }

  async findById(id: string): Promise<Template | null> {
    const template = await TemplateModel.findById(id);
    return template ? (template.toJSON() as Template) : null;
  }

  async findByIds(ids: string[]): Promise<Template[]> {
    const templates = await TemplateModel.find({ _id: { $in: ids } });
    return templates.map(t => t.toJSON() as Template);
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Template[]> {
    const templates = await TemplateModel.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    return templates.map(t => t.toJSON() as Template);
  }

  async findByCategory(category: string, limit: number = 50, offset: number = 0): Promise<Template[]> {
    const templates = await TemplateModel.find({ category })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    return templates.map(t => t.toJSON() as Template);
  }

  async findTrending(
    limit: number = 20,
    _period: 'week' | 'month' = 'week',
    offset: number = 0,
    category?: string
  ): Promise<Template[]> {
    // Temporarily return popular items regardless of date since there isn't enough recent activity

    const query: any = {};
    if (category) {
      query.category = category;
    }

    // Get templates sorted by engagement
    const templates = await TemplateModel.find(query)
      .sort({
        usageCount: -1,
        likeCount: -1,
        viewCount: -1
      })
      .skip(offset)
      .limit(limit);

    return templates.map(t => t.toJSON() as Template);
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<Template[]> {
    const templates = await TemplateModel.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(offset)
      .limit(limit);
    return templates.map(t => t.toJSON() as Template);
  }

  async update(id: string, data: UpdateTemplateDTO): Promise<Template | null> {
    const template = await TemplateModel.findByIdAndUpdate(id, data, { new: true });
    return template ? (template.toJSON() as Template) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TemplateModel.findByIdAndDelete(id);
    return !!result;
  }

  async incrementViewCount(id: string): Promise<void> {
    await TemplateModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async incrementLikeCount(id: string): Promise<void> {
    await TemplateModel.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });
  }

  async decrementLikeCount(id: string): Promise<void> {
    await TemplateModel.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
  }

  async updateLikeCount(id: string, count: number): Promise<void> {
    await TemplateModel.findByIdAndUpdate(id, { $set: { likeCount: count } });
  }

  async updateUsageCount(id: string, count: number): Promise<void> {
    await TemplateModel.findByIdAndUpdate(id, { $set: { usageCount: count } });
  }
}
