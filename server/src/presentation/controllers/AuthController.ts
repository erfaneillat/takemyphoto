import { Request, Response } from 'express';
import { SendVerificationCodeUseCase } from '@application/usecases/auth/SendVerificationCodeUseCase';
import { VerifyCodeUseCase } from '@application/usecases/auth/VerifyCodeUseCase';
import { GoogleAuthUseCase } from '@application/usecases/auth/GoogleAuthUseCase';
import { AdminLoginUseCase } from '@application/usecases/auth/AdminLoginUseCase';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  constructor(
    private sendVerificationCodeUseCase: SendVerificationCodeUseCase,
    private verifyCodeUseCase: VerifyCodeUseCase,
    private googleAuthUseCase: GoogleAuthUseCase,
    private adminLoginUseCase: AdminLoginUseCase
  ) {}

  sendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    await this.sendVerificationCodeUseCase.execute(phoneNumber);

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent successfully'
    });
  });

  verifyCode = asyncHandler(async (req: Request, res: Response) => {
    const { phoneNumber, code } = req.body;

    const result = await this.verifyCodeUseCase.execute(phoneNumber, code);

    res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });
  });

  googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { googleId, email, name, firstName, lastName, profilePicture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Google ID and email are required'
      });
    }

    const result = await this.googleAuthUseCase.execute({
      googleId,
      email,
      name,
      firstName,
      lastName,
      profilePicture
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        isNewUser: result.isNewUser
      }
    });
  });

  adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const result = await this.adminLoginUseCase.execute({ email, password });

    return res.status(200).json({
      status: 'success',
      data: {
        admin: result.admin,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });
  });
}
