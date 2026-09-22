import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return secret;
};

export const hashPassword = async (plain: string) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);
  return hash;
};

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};

export const signJwt = (user: User) => {
  const payload = { sub: user.id, email: user.email, name: user.name };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { sub: string; email: string; name?: string };
    return decoded;
  } catch (err) {
    return null;
  }
};
