import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

// One shared cache for /api/weather and /api/compare
const cache = new TtlCache(config.cacheTtlSeconds);

// Maps Open-Meteo's response onto our summary shape
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

// Single-city lookup used by both routes
export async function getCityWeather(city) {
  // Case-insensitive so Toronto/toronto are all valid/hit the same cache entry
  const key = city.toLowerCase();

  const stored = cache.get(key);
  if (stored) {
    return { ...stored, cached: true };
  }

  // Timestamp for upstream call
  const fetchedAt = new Date().toISOString();

  // Any failure throws before set(), so errors never get cached
  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);
  const summary = buildSummary(location, forecast, fetchedAt);

  cache.set(key, summary);
  return summary;
}

export function getCacheStats() {
  return cache.stats();
}