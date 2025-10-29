import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  phoneNumber?: string;
  email?: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}

export class JwtService implements ITokenService {
  constructor() {
    console.log('[JwtService] Initialized with:', {
      accessTokenSecret: (process.env.JWT_SECRET || 'default-secret').substring(0, 10) + '...',
      refreshTokenSecret: (process.env.JWT_REFRESH_SECRET || 'default-refresh-secret').substring(0, 10) + '...',
      accessTokenExpiry: process.env.JWT_EXPIRES_IN || '7d',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
  }

  generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(payload, secret, {
      expiresIn
    } as jwt.SignOptions);
    console.log('[JwtService] Generated access token for:', payload.phoneNumber);
    return token;
  }

  generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    return jwt.sign(payload, secret, {
      expiresIn
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as TokenPayload;
      console.log('[JwtService] Verified access token for:', decoded.phoneNumber);
      return decoded;
    } catch (error) {
      console.error('[JwtService] Token verification failed:', {
        error: (error as Error).message,
        tokenPreview: token.substring(0, 50) + '...',
        secretPreview: (process.env.JWT_SECRET || 'default-secret').substring(0, 10) + '...',
      });
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
