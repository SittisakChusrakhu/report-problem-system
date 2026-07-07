// Centralized fallback error handler. Controllers already catch their own
// errors, so this mainly catches anything unexpected (sync throws, routes
// with no try/catch, etc.) so the process never dies without a response.
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
};
