import { User } from '../models/user.js';
import { ZodObject, ZodRawShape } from 'zod';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      validatedBody?: Record<string, any>;
      validatedQuery?: Record<string, any>;
      validatedParams?: Record<string, any>;
    }
  }
}
