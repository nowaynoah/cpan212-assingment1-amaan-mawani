// One line per request once the response is sent: GET /api/weather?city=Toronto 200 412ms
export function requestLogger(req, res, next) {
  const started = performance.now();
  res.on('finish', () => {
    const ms = Math.round(performance.now() - started);
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
