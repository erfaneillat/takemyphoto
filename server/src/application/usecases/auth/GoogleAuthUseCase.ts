import { IUserRepository } from '@core/domain/repositories/IUserRepository';
import { ITokenService } from '@infrastructure/services/JwtService';
import { User } from '@core/domain/entities/User';

export interface GoogleAuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface GoogleUserData {
  googleId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export class GoogleAuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService
  ) {}

  async execute(googleUserData: GoogleUserData): Promise<GoogleAuthResult> {
    // Check if user exists by Google ID
    let user = await this.userRepository.findByGoogleId(googleUserData.googleId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists by email
      user = await this.userRepository.findByEmail(googleUserData.email);

      if (user) {
        // Update existing user with Google ID
        user = await this.userRepository.update(user.id, {
          googleId: googleUserData.googleId,
          name: googleUserData.name || user.name,
          firstName: googleUserData.firstName || user.firstName,
          lastName: googleUserData.lastName || user.lastName,
          profilePicture: googleUserData.profilePicture || undefined,
          isVerified: true
        }) || user;
      } else {
        // Create new user
        // Derive first/last from name if not provided
        const fullName = googleUserData.name || '';
        const [derivedFirst, ...rest] = fullName.trim().split(' ');
        const derivedLast = rest.join(' ').trim() || undefined;

        user = await this.userRepository.create({
          googleId: googleUserData.googleId,
          email: googleUserData.email,
          name: googleUserData.name,
          firstName: googleUserData.firstName || derivedFirst || undefined,
          lastName: googleUserData.lastName || derivedLast,
          profilePicture: googleUserData.profilePicture
        });
        isNewUser = true;
      }

      // Mark user as verified
      if (!user.isVerified) {
        user = await this.userRepository.update(user.id, { isVerified: true }) || user;
      }
    } else {
      // Update existing Google user's profile if needed
      const updates: any = {};
      if (googleUserData.name && googleUserData.name !== user.name) {
        updates.name = googleUserData.name;
      }
      if (googleUserData.firstName && googleUserData.firstName !== user.firstName) {
        updates.firstName = googleUserData.firstName;
      }
      if (googleUserData.lastName && googleUserData.lastName !== user.lastName) {
        updates.lastName = googleUserData.lastName;
      }
      if (googleUserData.profilePicture && googleUserData.profilePicture !== user.profilePicture) {
        updates.profilePicture = googleUserData.profilePicture;
      }

      if (Object.keys(updates).length > 0) {
        user = await this.userRepository.update(user.id, updates) || user;
      }
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    return {
      user,
      accessToken,
      refreshToken,
      isNewUser
    };
  }
}
