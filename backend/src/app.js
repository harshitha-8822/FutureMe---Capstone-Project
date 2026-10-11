import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import recommendRoutes from './routes/recommend.routes.js';
import authRoutes from './routes/auth.routes.js';
import libraryRoutes from './routes/library.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { careerStreams } from './data/indianCareers.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Gentle rate limit on AI endpoints to avoid runaway Gemini usage.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please wait a minute and try again.' },
});

// Health + meta
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'FutureMe API' }));
app.get('/api/streams', (_req, res) => res.json({ streams: careerStreams }));

// Core spine (AI). The limiter is attached per route inside recommendRoutes:
// mounting it here would also count logins, saves and profile loads.
app.use('/api', recommendRoutes(aiLimiter));

// Auth + saved library (require MySQL)
app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/profile', profileRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

export default app;
