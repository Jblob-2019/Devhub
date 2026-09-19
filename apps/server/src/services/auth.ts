import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

export const hashPassword = async (plain: string) => {
  const saltRounds = 10; // can be tuned via env if needed
  const hash = await bcrypt.hash(plain, saltRounds);
  return hash;
};

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};

export const signJwt = (user: User) => {
  // payload minimal: user id, email, optionally name
  const payload = { sub: user.id, email: user.email, name: user.name };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; name?: string };
    return decoded;
  } catch (err) {
    return null;
  }
};
