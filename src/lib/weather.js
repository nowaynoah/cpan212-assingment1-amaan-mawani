import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';

// TODO (you): create one cache for the whole app, with a time to live of
// config.cacheTtlSeconds.

// Maps Open-Meteo's response onto summary shape
function buildSummary(location, forecast, fetchedAt) {
  const { current, daily } = forecast;

  return {
    location,
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditions: describeWeatherCode(current.weather_code),
    },
    // daily comes back as parallel arrays, one index per day
    daily: daily.time.map((date, i) => ({
      date,
      minC: daily.temperature_2m_min[i],
      maxC: daily.temperature_2m_max[i],
      precipitationChancePercent: daily.precipitation_probability_max[i] ?? null,
      weatherCode: daily.weather_code[i],
      conditions: describeWeatherCode(daily.weather_code[i]),
    })),
    fetchedAt,
    cached: false,
  };
}

// TODO (you): return the weather summary for one city, in the shape shown on
// the assignment page. Check the cache first. On a miss, geocode the city, get
// the forecast, build the summary, store it, and return it with cached: false.
// On a hit, return the stored summary with cached: true.
export async function getCityWeather(city) {
  // timestamp the upstream call, not the response
  const fetchedAt = new Date().toISOString();

  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);

  return buildSummary(location, forecast, fetchedAt);
}

// TODO (you): return the cache statistics for GET /api/cache/stats.
export function getCacheStats() {
  throw new Error('getCacheStats is not written yet');
}