import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './auth';

export interface AuthRequest extends Request {
  userId: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const { userId } = verifyToken(authHeader.slice(7));
    (req as AuthRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
