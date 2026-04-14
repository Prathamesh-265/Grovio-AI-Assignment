function notFound(req, res, next) {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}

function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
