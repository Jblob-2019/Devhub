import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
});
