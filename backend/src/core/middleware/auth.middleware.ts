import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: 'admin' | 'operator' | 'viewer' };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing token' });
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthRequest['user'];
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function authorizeRoles(...roles: Array<'admin' | 'operator' | 'viewer'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    next();
  };
}
