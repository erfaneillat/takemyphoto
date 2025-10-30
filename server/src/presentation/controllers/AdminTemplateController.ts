import { Request, Response } from 'express';
import { CreateTemplateUseCase } from '@application/usecases/template/CreateTemplateUseCase';
import { GetTemplatesUseCase } from '@application/usecases/template/GetTemplatesUseCase';
import { UpdateTemplateUseCase } from '@application/usecases/template/UpdateTemplateUseCase';
import { DeleteTemplateUseCase } from '@application/usecases/template/DeleteTemplateUseCase';
import { ImportTemplatesUseCase } from '@application/usecases/template/ImportTemplatesUseCase';
import { asyncHandler } from '../middleware/errorHandler';
import { IFileUploadService } from '@infrastructure/services/FileUploadService';

export class AdminTemplateController {
  constructor(
    private createTemplateUseCase: CreateTemplateUseCase,
    private getTemplatesUseCase: GetTemplatesUseCase,
    private updateTemplateUseCase: UpdateTemplateUseCase,
    private deleteTemplateUseCase: DeleteTemplateUseCase,
    private importTemplatesUseCase: ImportTemplatesUseCase,
    private fileUploadService: IFileUploadService
  ) {}

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { category, search, trending, limit, offset } = req.query;

    const templates = await this.getTemplatesUseCase.execute({
      category: category as string,
      search: search as string,
      trending: trending === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.status(200).json({
      status: 'success',
      data: { templates }
    });
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new Error('Image is required');
    }

    const uploaded = await this.fileUploadService.uploadImage(req.file, 'nero/templates');

    const tags: string[] | undefined = (() => {
      const raw = (req.body.tags ?? '').toString();
      if (!raw) return undefined;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map((t) => String(t));
      } catch (_) {
        // fallback: comma separated
        return raw
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
      return undefined;
    })();

    const data = {
      prompt: req.body.prompt,
      style: req.body.style || undefined,
      category: req.body.category,
      tags,
      imageUrl: uploaded.url,
      publicId: uploaded.publicId,
    };

    const template = await this.createTemplateUseCase.execute(data);

    res.status(201).json({
      status: 'success',
      data: { template }
    });
  });

  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await this.updateTemplateUseCase.execute(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { template }
    });
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteTemplateUseCase.execute(id);

    res.status(204).send();
  });

  importTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required');
    }

    const result = await this.importTemplatesUseCase.execute(items);

    res.status(200).json({
      status: 'success',
      data: { result }
    });
  });
}
