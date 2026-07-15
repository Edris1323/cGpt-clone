export const errorHandler = (err, req, res, next) => {
  console.error("Error in request: ", err.message || err);

  // If headers are already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    status: false,
    message: err.message || "Something went wrong, please try again",
  });
};
