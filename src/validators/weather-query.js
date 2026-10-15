import { HttpError } from '../lib/http-error.js';

// Shared 400 shape:
function invalid(field, reason) {
  return new HttpError(400, 'Invalid query', { [field]: reason });
}

// ?city
export function parseCity(value) {
  if (Array.isArray(value)) {
    throw invalid('city', 'city must be sent only once');
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalid('city', 'city is required');
  }

  const city = value.trim();
  if (city.length < 2 || city.length > 60) {
    throw invalid('city', 'city must be 2 to 60 characters');
  }

  return city;
}

// ?cities=a,b,c -> array of trimmed names
export function parseCities(value) {
  if (Array.isArray(value)) {
    throw invalid('cities', 'cities must be sent only once');
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalid('cities', 'cities is required');
  }

  const cities = value.split(',').map((name) => name.trim());

  // catches "Toronto,,Halifax" and trailing commas
  if (cities.includes('')) {
    throw invalid('cities', 'cities must not contain an empty name');
  }
  if (cities.length < 2 || cities.length > 5) {
    throw invalid('cities', 'cities must list 2 to 5 cities');
  }

  for (const city of cities) {
    if (city.length < 2 || city.length > 60) {
      throw invalid('cities', `"${city}" must be 2 to 60 characters`);
    }
  }

  // Duplicates are case-insensitive 
  const seen = new Set();
  for (const city of cities) {
    const key = city.toLowerCase();
    if (seen.has(key)) {
      throw invalid('cities', `"${city}" is listed more than once`);
    }
    seen.add(key);
  }

  return cities;
}