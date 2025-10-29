import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@infrastructure/services/JwtService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phoneNumber?: string;
    email?: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const jwtService = new JwtService();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[authMiddleware] Missing or malformed Authorization header', {
        path: req.path,
        method: req.method,
        hasHeader: !!authHeader,
        headerPreview: authHeader ? authHeader.substring(0, 20) + '...' : undefined,
      });
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyAccessToken(token);
    console.info('[authMiddleware] Token verified', {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      path: req.path,
      method: req.method,
    });

    req.user = payload;
    next();
  } catch (error) {
    console.error('[authMiddleware] Verification error', {
      path: req.path,
      method: req.method,
      error: (error as Error)?.message,
    });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const jwtService = new JwtService();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    // Invalid token, continue without user info
    console.warn('[optionalAuthMiddleware] Token verification failed, continuing without auth', {
      path: req.path,
      method: req.method,
      error: (error as Error)?.message,
    });
    next();
  }
};
