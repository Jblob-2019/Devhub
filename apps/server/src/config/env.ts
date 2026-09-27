import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory, parent directory, and root workspace
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}
dotenv.config(); // fallback to standard dotenv lookup

// Override PORT for local development to use 4000
if (!process.env.PORT || process.env.PORT === '5000') {
  process.env.PORT = '4000';
}

const isProd = process.env.NODE_ENV === 'production';

// Fail fast in production if required variables are missing
if (isProd) {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required production environment variables: ${missing.join(', ')}`);
  }
}