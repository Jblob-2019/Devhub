import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '../../.env');
dotenv.config({ path: envPath });

import { query } from './src/config/db.js';

const result = await query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`);
console.log('Users table columns:');
result.rows.forEach(r => console.log('  ' + r.column_name + ': ' + r.data_type + ' (' + (r.is_nullable === 'YES' ? 'nullable' : 'NOT NULL') + ')'));