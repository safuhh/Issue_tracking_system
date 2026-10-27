import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Verify access token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error('ACCESS_TOKEN_SECRET not configured');

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: UserRole;
    };

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Access token expired' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid access token' });
    }
  }
};

// RBAC: authorize specific roles with database verification
export const authorize = (...roles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Verify authenticated user's current role directly from the database
      const dbUser = await User.findById(req.user.id).select('role email');
      if (!dbUser) {
        res.status(401).json({ success: false, message: 'User account no longer exists' });
        return;
      }

      if (!roles.includes(dbUser.role)) {
        res.status(403).json({
          success: false,
          message: `Role '${dbUser.role}' is not authorized to access this resource`,
        });
        return;
      }

      // Sync active database role with req.user
      req.user.role = dbUser.role;
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error during role verification' });
    }
  };
};
