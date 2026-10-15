import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.
// The exact requests are on the assignment page.

// Fetches a URL and returns the parsed JSON, failure becomes an HttpError
// serviceName goes into the error messages
async function fetchJson(url, serviceName) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(config.upstreamTimeoutMs) });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, `The ${serviceName} service did not respond within ${config.upstreamTimeoutMs} ms`);
    }
    throw new HttpError(502, `Could not get a valid response from the ${serviceName} service`);
  }

  if (!res.ok) {
    throw new HttpError(502, `Could not get a valid response from the ${serviceName} service`);
  }

  try {
    return await res.json();
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, `The ${serviceName} service did not respond within ${config.upstreamTimeoutMs} ms`);
    }
    throw new HttpError(502, `Could not get a valid response from the ${serviceName} service`);
  }
}

// Looks up city and returns first match. Will throw a 404 if no match is found. 
export async function geocodeCity(name) {
  const params = new URLSearchParams({
    name,
    count: '1',
    language: 'en',
    format: 'json',
  });
  const body = await fetchJson(`${config.geocodingUrl}/search?${params}`, 'geocoding');

  // No match = no results field
  if (!Array.isArray(body.results) || body.results.length === 0) {
    throw new HttpError(404, `City not found: ${name}`);
  }

  const match = body.results[0];
  return {
    name: match.name,
    region: match.admin1 ?? null,
    country: match.country ?? null,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
  };
}

// Current conditions + 3-day daily forecast - Units are Open-Meteo defaults
export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto', // dates/times local to the city
    forecast_days: '3',
  });

  return fetchJson(`${config.forecastUrl}/forecast?${params}`, 'forecast');
}
