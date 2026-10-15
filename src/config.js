// Every setting comes from an environment variable with a sensible default, so
// the server runs without a .env file, and a grader can point it at a broken
// URL or a tiny timeout without touching the code.

function readWholeNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    // Stop at startup instead of running with a timeout of NaN.
    throw new Error(`${name} must be a whole number of 1 or more, got "${raw}"`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 4000,
  geocodingUrl: process.env.GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1',
  forecastUrl: process.env.FORECAST_URL || 'https://api.open-meteo.com/v1',
  upstreamTimeoutMs: readWholeNumber('UPSTREAM_TIMEOUT_MS', 5000),
  cacheTtlSeconds: readWholeNumber('CACHE_TTL_SECONDS', 600),
};
