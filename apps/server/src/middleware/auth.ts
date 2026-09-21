import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { verifyJwt } from '../services/auth.js';
import { findUserById } from '../models/user.js';

export const parseCookies = cookieParser();

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.session;
  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const payload = verifyJwt(token as string);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  // Attach user info to request
  const user = await findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  // @ts-ignore – augmenting request type
  req.user = user;
  // @ts-ignore – expose userId for downstream handlers
  req.userId = user.id;
  next();
};
