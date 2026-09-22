import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
};

export const query = (text: string, params?: any[]) => {
  return getPool().query(text, params);
};
