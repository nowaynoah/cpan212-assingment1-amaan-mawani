import express from 'express';
import { requestLogger } from './middleware/request-logger.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { weatherRouter } from './routes/weather.routes.js';
import { cacheRouter } from './routes/cache.routes.js';

export const app = express();

app.use(requestLogger);

app.use('/api', weatherRouter);
app.use('/api', cacheRouter);

app.use(notFound);
app.use(errorHandler);
