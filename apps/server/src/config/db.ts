import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const isProd = process.env.NODE_ENV === 'production';

    const poolConfig: PoolConfig = {
      connectionString,
      // Connection pool limits
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      // Supabase requires SSL
      ssl: isProd ? { rejectUnauthorized: false } : false,
      // Additional stability settings
      allowExitOnIdle: true,
    };

    pool = new Pool(poolConfig);

    // Log pool events for debugging
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
};

export const query = (text: string, params?: any[]) => {
  return getPool().query(text, params);
};

// Graceful shutdown helper
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
