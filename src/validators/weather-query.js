import { HttpError } from '../lib/http-error.js';

// Shared 400 shape:
function invalid(field, reason) {
  return new HttpError(400, 'Invalid query', { [field]: reason });
}

// ?city=
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

// TODO (you): check ?cities= and return an array of trimmed city names. Throw a
// 400 HttpError with details.cities when it breaks a rule from the assignment page.
export function parseCities(value) {
  throw new Error('parseCities is not written yet');
}
