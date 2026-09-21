import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import githubRouter from './routes/github.js';
import favoritesRouter from './routes/favorites.js';
import authRouter from './routes/auth.js';
import { parseCookies } from './middleware/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(parseCookies); // parse cookies for auth & OAuth state
app.use(express.json());

// Public API routes (still accessible without auth)
app.use('/api/favorites', favoritesRouter);

// Auth routes (register, login, logout, me, GitHub OAuth)
app.use('/api/github', githubRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
});
