import { HttpError } from '../lib/http-error.js';

// Express treats a 4-arg middleware as the error handler
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Expected failures carry their own status
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  // Anything else is a bug, logs full error here, never leaks it to the client
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}