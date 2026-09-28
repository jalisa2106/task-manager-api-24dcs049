const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const requireJson = require('./middleware/requireJson');
const auth = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const cache = require('./config/cache');

const app = express();

// ---- Pipeline order matters: cors -> logger -> content-type check -> body parser -> routes -> 404 -> error handler
app.use(cors());
app.use(logger);
app.use(requireJson);
app.use(express.json());

app.use('/auth', authRoutes);          // public: register + login (+ /me is protected inside)
app.use('/tasks', auth, taskRoutes);   // protected: every task route needs a valid JWT

app.get('/logs', auth, (req, res) => res.status(200).json(logger.requestLogs));

// Practical 9 (assignment): Debug cache stats endpoint
app.get('/debug/cache', auth, (req, res) => {
  res.status(200).json({ enabled: process.env.CACHE_ENABLED !== 'false', ...cache.getStats() });
});

app.get('/trigger-error', (req, res, next) => {
  next(new Error('Simulated server error for testing the global error handler'));
});

app.use(notFound);      // unknown routes -> JSON 404
app.use(errorHandler);  // MUST be the very last middleware

module.exports = app;
