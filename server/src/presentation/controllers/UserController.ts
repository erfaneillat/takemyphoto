import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GetUserProfileUseCase } from '@application/usecases/user/GetUserProfileUseCase';
import { GetUsersUseCase } from '@application/usecases/user/GetUsersUseCase';
import { GetUserStatsUseCase } from '@application/usecases/user/GetUserStatsUseCase';
import { UpdateUserUseCase } from '@application/usecases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '@application/usecases/user/DeleteUserUseCase';
import { asyncHandler } from '../middleware/errorHandler';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';

export class UserController {
  constructor(
    private getUserProfileUseCase: GetUserProfileUseCase,
    private getUsersUseCase: GetUsersUseCase,
    private getUserStatsUseCase: GetUserStatsUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private userRepository: IUserRepository
  ) {}

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const profile = await this.getUserProfileUseCase.execute(userId);

    res.status(200).json({
      status: 'success',
      data: profile
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { name, email } = req.body;

    const user = await this.userRepository.update(userId, { name, email });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const user = await this.userRepository.findById(userId);

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Admin methods
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const subscription = req.query.subscription as string;
    const search = req.query.search as string;

    const filters = {
      ...(role && { role }),
      ...(subscription && { subscription }),
      ...(search && { search })
    };

    const result = await this.getUsersUseCase.execute(page, limit, filters);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  getUserStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const stats = await this.getUserStatsUseCase.execute();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await this.updateUserUseCase.execute(id, updateData);

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await this.deleteUserUseCase.execute(id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  });
}
