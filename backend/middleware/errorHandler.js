// Global error handler: 4 arguments = Express treats it as an error handler
module.exports = function errorHandler(err, req, res, next) {
  console.error('Error occurred in pipeline:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation Error', message: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format', message: `Invalid value for field ${err.path}` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON', message: 'Request body is not valid JSON' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Conflict', message: 'A record with this value already exists' });
  }

  // Never send err.message or err.stack for unexpected errors
  res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong on the server' });
};
