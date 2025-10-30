import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { ITemplateRepository } from '@core/domain/repositories/ITemplateRepository';
import { GeneratedImageEntity } from '@core/domain/entities/GeneratedImageEntity';
import { Template } from '@core/domain/entities/Template';

// Panel expects this shape
export interface PanelGeneratedImage {
  id: string;
  userId: string;
  type: 'generate' | 'edit';
  prompt: string;
  imageUrl: string;
  publicId: string;
  parentId?: string;
  templateId?: string;
  metadata: {
    aspectRatio?: string;
    quality?: string;
    style?: string;
    sourceImages?: string[];
  };
  createdAt: string;
  template?: Pick<Template, 'id' | 'imageUrl' | 'style' | 'category' | 'prompt'>;
}

export interface GetGeneratedImagesResult {
  images: PanelGeneratedImage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const mapType = (t: GeneratedImageEntity['type']): 'generate' | 'edit' =>
  t === 'IMAGETOIAMGE' ? 'edit' : 'generate';

export class GetGeneratedImagesUseCase {
  constructor(
    private generatedImageEntityRepository: IGeneratedImageEntityRepository,
    private templateRepository: ITemplateRepository
  ) {}

  async execute(page: number = 1, limit: number = 50): Promise<GetGeneratedImagesResult> {
    const skip = (page - 1) * limit;

    // Read from the same collection generation/edit writes to
    const entities = await this.generatedImageEntityRepository.findAll(limit, skip);
    const total = await this.generatedImageEntityRepository.countAll();

    // Collect template IDs
    const templateIds = Array.from(
      new Set(entities.filter(e => !!e.templateId).map(e => e.templateId as string))
    );

    const templates = templateIds.length > 0
      ? await this.templateRepository.findByIds(templateIds)
      : [];
    const templateMap = new Map(templates.map(t => [t.id, t]));

    // Map to panel shape
    const images: PanelGeneratedImage[] = entities.map(e => {
      const tmpl = e.templateId ? templateMap.get(e.templateId) : undefined;
      return {
        id: e.id,
        userId: e.userId,
        type: mapType(e.type),
        prompt: e.prompt,
        imageUrl: e.imageUrl || '',
        publicId: e.id, // no publicId in entity; use id placeholder
        parentId: undefined,
        templateId: e.templateId,
        metadata: {
          sourceImages: e.referenceImageUrls || [],
        },
        createdAt: (e.createdAt as Date).toISOString(),
        template: tmpl
          ? {
              id: tmpl.id,
              imageUrl: tmpl.imageUrl,
              style: tmpl.style,
              category: tmpl.category,
              prompt: tmpl.prompt,
            }
          : undefined,
      };
    });

    return {
      images,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
