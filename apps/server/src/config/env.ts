import dotenv from 'dotenv';
import path from 'path';

// Use process.cwd() which is the working directory when the server starts
// When running from apps/server, cwd is apps/server, so we need to go up two levels
const envPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: envPath });

// Override PORT for local development to use 4000
// Use 4000 when not explicitly set to production (i.e., local dev)
if (!process.env.PORT || process.env.PORT === '5000') {
  process.env.PORT = '4000';
}