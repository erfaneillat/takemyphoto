import { IAdminRepository } from '@core/domain/repositories/IAdminRepository';
import { ITokenService } from '@infrastructure/services/JwtService';
import bcrypt from 'bcryptjs';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginOutput {
  admin: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AdminLoginUseCase {
  constructor(
    private adminRepository: IAdminRepository,
    private tokenService: ITokenService
  ) {}

  async execute(input: AdminLoginInput): Promise<AdminLoginOutput> {
    const { email, password } = input;

    // Find admin by email
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.adminRepository.updateLastLogin(admin.id);

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: admin.id,
      email: admin.email,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: admin.id,
      email: admin.email,
    });

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      accessToken,
      refreshToken,
    };
  }
}
