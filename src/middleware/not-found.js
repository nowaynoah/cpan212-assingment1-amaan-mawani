export function notFound(req, res) {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.path}` } });
}
