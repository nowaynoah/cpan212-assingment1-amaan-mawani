import { Router } from 'express';
import { parseCity } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';

const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

export const weatherRouter = Router();

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const weather = await getCityWeather(city);
  res.json({ data: weather, attribution: ATTRIBUTION });
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
// Validate with parseCities, start every lookup at once with Promise.allSettled,
// then build the cities array and the summary described on the assignment page.
weatherRouter.get('/compare', (req, res) => {
  res.status(501).json({ error: { message: 'Not written yet: GET /api/compare' } });
});
