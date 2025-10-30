import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { IStyleUsageRepository } from '@core/domain/repositories/IStyleUsageRepository';

export class SyncTemplateStatsUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private styleUsageRepository: IStyleUsageRepository
  ) {}

  async execute(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      // Get all templates
      const templates = await this.templateRepository.findAll(10000, 0);

      for (const template of templates) {
        try {
          // Get usage count for this template
          const usageCount = await this.styleUsageRepository.countByTemplateId(template.id);
          // Update template's likeCount and usageCount to match usage count
          await this.templateRepository.updateLikeCount(template.id, usageCount);
          await this.templateRepository.updateUsageCount(template.id, usageCount);

          synced++;
        } catch (error) {
          console.error(`Error syncing template ${template.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Synced ${synced} templates, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('Error syncing template stats:', error);
      throw error;
    }
  }

  async syncSingleTemplate(templateId: string): Promise<void> {
    const usageCount = await this.styleUsageRepository.countByTemplateId(templateId);
    await this.templateRepository.updateLikeCount(templateId, usageCount);
    await this.templateRepository.updateUsageCount(templateId, usageCount);
  }
}
