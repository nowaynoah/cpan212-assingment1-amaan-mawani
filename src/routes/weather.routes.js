import { Router } from 'express';
import { parseCity, parseCities } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';
import { HttpError } from '../lib/http-error.js';

export const weatherRouter = Router();

const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const weather = await getCityWeather(city);
  res.json({ data: weather, attribution: ATTRIBUTION });
});

// Same status/message /api/weather would have sent for this failure
function toCityError(err) {
  if (err instanceof HttpError) {
    return { status: err.status, message: err.message };
  }
  console.error(err);
  return { status: 500, message: 'Internal server error' };
}

// GET /api/compare?cities=Toronto,Vancouver,Halifax
weatherRouter.get('/compare', async (req, res) => {
  const names = parseCities(req.query.cities);

  const results = await Promise.allSettled(names.map((name) => getCityWeather(name)));

  const cities = results.map((result, i) =>
    result.status === 'fulfilled'
      ? { city: names[i], ok: true, weather: result.value }
      : { city: names[i], ok: false, error: toCityError(result.reason) },
  );

  // Strict > / < so the first city listed wins a tie
  let warmest = null;
  let coldest = null;
  for (const entry of cities) {
    if (!entry.ok) continue;
    const temp = entry.weather.current.temperatureC;
    if (warmest === null || temp > warmest.weather.current.temperatureC) warmest = entry;
    if (coldest === null || temp < coldest.weather.current.temperatureC) coldest = entry;
  }

  const succeeded = cities.filter((entry) => entry.ok).length;

  res.json({
    data: {
      cities,
      summary: {
        succeeded,
        failed: cities.length - succeeded,
        warmest: warmest ? warmest.weather.location.name : null,
        coldest: coldest ? coldest.weather.location.name : null,
      },
    },
    attribution: ATTRIBUTION,
  });
});