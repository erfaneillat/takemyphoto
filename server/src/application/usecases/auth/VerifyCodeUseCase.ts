import { IVerificationCodeRepository } from '@core/domain/repositories/IVerificationCodeRepository';
import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { ITokenService } from '@infrastructure/services/JwtService';
import { User } from '@core/domain/entities/User';

export interface VerifyCodeResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class VerifyCodeUseCase {
  constructor(
    private verificationCodeRepository: IVerificationCodeRepository,
    private userRepository: IUserRepository,
    private tokenService: ITokenService
  ) {}

  async execute(phoneNumber: string, code: string): Promise<VerifyCodeResult> {
    // Find the verification code
    const verificationCode = await this.verificationCodeRepository.findValidCode(phoneNumber, code);

    if (!verificationCode) {
      throw new Error('Invalid or expired verification code');
    }

    // Check attempts (max 5 attempts)
    if (verificationCode.attempts >= 5) {
      throw new Error('Too many attempts. Please request a new code');
    }

    // Increment attempts
    await this.verificationCodeRepository.incrementAttempts(verificationCode.id);

    // Mark code as used
    await this.verificationCodeRepository.markAsUsed(verificationCode.id);

    // Find or create user
    let user = await this.userRepository.findByPhoneNumber(phoneNumber);

    if (!user) {
      user = await this.userRepository.create({
        phoneNumber
      });
    }

    // Update user verification status
    if (!user.isVerified) {
      user = await this.userRepository.update(user.id, { isVerified: true }) || user;
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      phoneNumber: user.phoneNumber
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      phoneNumber: user.phoneNumber
    });

    return {
      user,
      accessToken,
      refreshToken
    };
  }
}
