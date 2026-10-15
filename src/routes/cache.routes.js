import { Router } from 'express';

export const cacheRouter = Router();

// TODO (you): respond with { data: <the cache statistics> }.
cacheRouter.get('/cache/stats', (req, res) => {
  res.status(501).json({ error: { message: 'Not written yet: GET /api/cache/stats' } });
});
