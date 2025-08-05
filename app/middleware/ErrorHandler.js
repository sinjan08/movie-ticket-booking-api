// app/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
