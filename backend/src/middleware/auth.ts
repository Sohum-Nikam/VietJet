import { Request, Response, NextFunction } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';

// Extended Request interface for auth
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Invalid token format', 401);
    }

    // For now, we'll implement a simple token validation
    // In production, this would verify JWT token and extract user info
    // TODO: Implement proper JWT verification with Supabase
    
    // Mock user for development
    req.user = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
    };

    logger.info('User authenticated', { userId: req.user.id });
    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    next(error);
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('User not authenticated', 401));
      return;
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};