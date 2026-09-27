import './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import githubRouter from './routes/github.js';
import favoritesRouter from './routes/favorites.js';
import authRouter from './routes/auth.js';
import { parseCookies } from './middleware/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const isProd = process.env.NODE_ENV === 'production';

// --- Security Middleware ---
// Helmet for secure HTTP headers (CSP, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// --- CORS Configuration ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (isProd && !origin) {
      return callback(new Error('Origin header required'));
    }
    if (!origin && !isProd) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(parseCookies);
app.use(express.json());

// --- Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/github', authLimiter);

app.use('/api/favorites', favoritesRouter);
app.use('/api/auth', authRouter);
app.use('/api/github', githubRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server listening on http://0.0.0.0:' + PORT);
  console.log('Environment: ' + (isProd ? 'production' : 'development'));
  console.log('Rate limiting: global=300/15min, auth=10/15min');
  console.log('Helmet: ' + (isProd ? 'enabled' : 'disabled (dev)'));
});
