import { Router } from 'express';
import { getCacheStats } from '../lib/weather.js';

export const cacheRouter = Router();

// GET /api/cache/stats
cacheRouter.get('/cache/stats', (req, res) => {
  res.json({ data: getCacheStats() });
});