import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GetUserProfileUseCase } from '@application/usecases/user/GetUserProfileUseCase';
import { asyncHandler } from '../middleware/errorHandler';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';

export class UserController {
  constructor(
    private getUserProfileUseCase: GetUserProfileUseCase,
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
}
