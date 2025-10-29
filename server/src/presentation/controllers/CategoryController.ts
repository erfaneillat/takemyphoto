import { Request, Response } from 'express';
import { CreateCategoryUseCase } from '@application/usecases/category/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '@application/usecases/category/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '@application/usecases/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '@application/usecases/category/DeleteCategoryUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class CategoryController {
  constructor(
    private createCategoryUseCase: CreateCategoryUseCase,
    private getCategoriesUseCase: GetCategoriesUseCase,
    private updateCategoryUseCase: UpdateCategoryUseCase,
    private deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.query;
    const categories = await this.getCategoriesUseCase.execute(
      isActive === 'true' ? true : isActive === 'false' ? false : undefined
    );

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.createCategoryUseCase.execute(req.body);

    res.status(201).json({
      status: 'success',
      data: { category }
    });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await this.updateCategoryUseCase.execute(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteCategoryUseCase.execute(id);

    res.status(204).send();
  });
}
